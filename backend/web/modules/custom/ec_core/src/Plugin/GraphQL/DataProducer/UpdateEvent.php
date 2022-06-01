<?php

namespace Drupal\ec_core\Plugin\GraphQL\DataProducer;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\ec_core\GraphQL\Response\EventResponse;
use Drupal\node\Entity\Node;
use Drupal\user\Entity\User;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Update an event entity.
 *
 * @DataProducer(
 *   id = "update_event",
 *   name = @Translation("Update Event"),
 *   description = @Translation("Update an event."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("Article")
 *   ),
 *   consumes = {
 *     "data" = @ContextDefinition("any",
 *       label = @Translation("Event data")
 *     )
 *   }
 * )
 */
class UpdateEvent extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $currentUser;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('current_user')
    );
  }

  /**
   * CreateArticle constructor.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param array $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Session\AccountInterface $current_user
   *   The current user.
   */
  public function __construct(array $configuration, string $plugin_id, array $plugin_definition, AccountInterface $current_user) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->currentUser = $current_user;
  }

  /**
   * Creates an event.
   *
   * @param array $data
   *   The submitted values for the event.
   *
   * @return \Drupal\ec_core\GraphQL\Response\EventResponse
   *   The updated event.
   *
   * @throws \Exception
   */
  public function resolve(array $data) {
    $response = new EventResponse();
    try {
      $node = Node::load($data['id']);
      $user = User::load($this->currentUser->id());
      if (!$node->access('update', $user)) {
        throw new AccessDeniedHttpException;
      }

      // Setup the categories for the format.
      $categories = [];
      foreach($data['categories'] as $category) {
        $categories[] = ['target_id' => $category];
      }

      // We want to loop through all of the volunteers already saved.
      $volunteers = $node->get('field_event_volunteers')->getValue();
      $volunteered = FALSE;
      foreach($volunteers as $key => $volunteer) {
        // Update the volunteer sections tied to the event if set.
        $paragraph = Paragraph::load($volunteer['target_id']);
        if ($paragraph->get('field_event_volunteer')->getValue()[0]['target_id'] === $this->currentUser->id()) {
          if ($data['remove'] == TRUE) {
            // Unset the volunteer list
            // and delete the paragrapgh.
            unset($volunteers[$key]);
            $paragraph->delete();
          }
          else {
            $paragraph->set('field_event_volunteer_category', $categories);
            $paragraph->set('field_event_volunteer_hrs_avail', $data['hours']);
            $paragraph->set('field_event_volunteer_notes', $data['note']);
            $paragraph->save();
          }
          $volunteered = TRUE;
          break;
        }
      }

      if (!$volunteered) {
        // Add volunteer record for each category.
        $paragraph = Paragraph::create(['type' => 'event_volunteer']);
        $paragraph->set('field_event_volunteer_category', $categories);
        $paragraph->set('field_event_volunteer_hrs_avail', $data['hours']);
        $paragraph->set('field_event_volunteer', $this->currentUser->id());
        $paragraph->set('field_event_volunteer_notes', $data['note']);
        $paragraph->isNew();
        $paragraph->save();
        $volunteers[] = [
          'target_id' => $paragraph->id(),
          'target_revision_id' => $paragraph->getRevisionId()
        ];
      }

      // Save the volunteers to the Node.
      $node->set('field_event_volunteers', $volunteers);

      //save to update node
      $node->save();
      $response->setEvent($node);
    }
    catch (\Exception $e) {
      \Drupal::logger(__CLASS__)->error($e->getMessage());
      $response->addViolation(
        $this->t('There was an error trying to save the Event')
      );
    }

    return $response;
  }

}

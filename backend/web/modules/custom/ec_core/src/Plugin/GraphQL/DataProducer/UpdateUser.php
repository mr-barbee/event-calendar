<?php

namespace Drupal\ec_core\Plugin\GraphQL\DataProducer;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\ec_core\GraphQL\Response\UserResponse;
use Drupal\node\Entity\Node;
use Drupal\user\Entity\User;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\Core\Password\PasswordInterface;

/**
 * Update the current user.
 *
 * @DataProducer(
 *   id = "update_user",
 *   name = @Translation("Update User"),
 *   description = @Translation("Update current user."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("User")
 *   ),
 *   consumes = {
 *     "data" = @ContextDefinition("any",
 *       label = @Translation("User data")
 *     )
 *   }
 * )
 */
class UpdateUser extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $currentUser;

  /**
   * Pasword Helper functions.
   *
   * @var \Drupal\Core\Password\PasswordInterface
   */
  protected $passwordHasher;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('current_user'),
      $container->get('password')
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
  public function __construct(array $configuration, string $plugin_id, array $plugin_definition, AccountInterface $current_user, PasswordInterface $password_hasher) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->currentUser = $current_user;
    $this->passwordHasher = $password_hasher;
  }

  /**
   * Creates an event.
   *
   * @param array $data
   *   The submitted values for the event.
   *
   * @return \Drupal\ec_core\GraphQL\Response\UserResponse
   *   The updated event.
   *
   * @throws \Exception
   */
  public function resolve(array $data) {
    $response = new UserResponse();
    try {

      $user = User::load($this->currentUser->id());
      // The fullname cant be empty.
      if (!empty($data['fullName'])) {
        $user->set('field_user_full_name', $data['fullName']);
      }
      if (isset($data['contact'])) {
        $user->set('field_user_contact', $data['contact']);
      }
      if (isset($data['note'])) {
        $user->set('field_user_note', $data['note']);
      }
      if (isset($data['phone'])) {
        $user->set('field_user_phone', $data['phone']);
      }
      if (isset($data['primary'])) {
        $user->set('field_user_primary_contact', $data['primary']);
      }
      if (isset($data['categories'])) {
        $categories = [];
        foreach($data['categories'] as $category) {
          $categories[] = ['target_id' => $category];
        }
        $user->set('field_user_categories', $categories);
      }
      if (isset($data['experiences'])) {
        $experiences = [];
        foreach($data['experiences'] as $experience) {
          $experiences[] = ['target_id' => $experience];
        }
        $user->set('field_user_experience_skills', $experiences);
      }
      // We only want to update the username, password,
      // and email if the current password is set.
      // We only change these if the data is set.
      if (isset($data['currPass']) && !empty($data['currPass'])) {
        // Check to see if the current password is correct.
        if (!$this->passwordHasher->check($data['currPass'], $user->getPassword())) {
          throw new \Exception('Your current password is not correct.');
        }
        if (!empty($data['name'])) {
          $user->setUsername($data['name']);
        }
        // Check the plain password with the
        // hashed password from db
        if (!empty($data['pass'])) {
          $user->setPassword($data['pass']);
        }
        if (!empty($data['email'])) {
          $user->setEmail($data['email']);
        }
      }
      // If the needs verification status is set
      // then we need to verify the user.
      if (isset($data['needs_verification']) && $data['needs_verification']) {
        $user->set('field_user_verified', FALSE);
      }
      //save to update node
      $user->save();
      $response->setUser($user);
    }
    catch (\Exception $e) {
      $message = $e->getMessage();
      \Drupal::logger(__CLASS__)->error($message);
      $response->addViolation(
        $this->t($message ?? 'There was an error trying to save the Event')
      );
    }

    return $response;
  }

}

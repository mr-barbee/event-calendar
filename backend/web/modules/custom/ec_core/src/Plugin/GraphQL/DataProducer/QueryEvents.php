<?php

namespace Drupal\ec_core\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\ec_core\Wrappers\QueryConnection;
use GraphQL\Error\UserError;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;

/**
 * @DataProducer(
 *   id = "query_events",
 *   name = @Translation("Load events"),
 *   description = @Translation("Loads a list of events."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("Event connection")
 *   ),
 *   consumes = {
 *     "offset" = @ContextDefinition("integer",
 *       label = @Translation("Offset"),
 *       required = FALSE
 *     ),
 *     "limit" = @ContextDefinition("integer",
 *       label = @Translation("Limit"),
 *       required = FALSE
 *     ),
 *     "date" = @ContextDefinition("string",
 *       label = @Translation("Date"),
 *       required = FALSE
 *     ),
 *     "range" = @ContextDefinition("string",
 *       label = @Translation("Range"),
 *       required = FALSE
 *     ),
 *     "user" = @ContextDefinition("integer",
 *       label = @Translation("User"),
 *       required = FALSE
 *     )
 *   }
 * )
 */
class QueryEvents extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  const MAX_LIMIT = 100;

  /**
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * {@inheritdoc}
   *
   * @codeCoverageIgnore
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('entity_type.manager')
    );
  }

  /**
   * Events constructor.
   *
   * @param array $configuration
   *   The plugin configuration.
   * @param string $pluginId
   *   The plugin id.
   * @param mixed $pluginDefinition
   *   The plugin definition.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *
   * @codeCoverageIgnore
   */
  public function __construct(
    array $configuration,
    $pluginId,
    $pluginDefinition,
    EntityTypeManagerInterface $entityTypeManager
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
    $this->entityTypeManager = $entityTypeManager;
  }

  /**
   * @param int $offset
   * @param int $limit
   * @param string $date
   * @param string $range
   * @param int $user
   * @param \Drupal\Core\Cache\RefinableCacheableDependencyInterface $metadata
   *
   * @return \Drupal\graphql_examples\Wrappers\QueryConnection
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function resolve($offset, $limit, $date, $range, $user, RefinableCacheableDependencyInterface $metadata) {
    if ($limit > static::MAX_LIMIT) {
      throw new UserError(sprintf('Exceeded maximum query limit: %s.', static::MAX_LIMIT));
    }
    // if the user was passed in then we want to get all the paragraph
    // volunteers that match that user id.
    if (!empty($user)) {
      // This query needs to pull all the paragraph ids that contain the user ID.
      $storage = \Drupal::entityTypeManager()->getStorage('paragraph');
      $entityType = $storage->getEntityType();
      $query = $storage->getQuery()
        ->currentRevision()
        ->accessCheck();
      $query->condition($entityType->getKey('bundle'), 'event_volunteer');
        $query->condition('field_event_volunteer.target_id', $user, '=');
      $results = $query->execute();
    }
    // Query the event content type based on the selected values.
    $storage = \Drupal::entityTypeManager()->getStorage('node');
    $entityType = $storage->getEntityType();
    $query = $storage->getQuery()
      ->currentRevision()
      ->accessCheck();
    $query->condition($entityType->getKey('bundle'), 'event');
    if (!empty($date)) {
      // Make the new date for the checking.
      $date = new DrupalDateTime($date);
      // Format the date to be used for seaching the database.
      $formatted = $date->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT);
      $query->condition('field_event_start_date.value', $formatted, '>=');
      // Modify the date to get
      // the range to look at.
      $date->modify($range);
      // Format the date to be used for seaching the database.
      $formatted = $date->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT);
      $query->condition('field_event_start_date.value', $formatted, '<=');
    }
    // This is passed from the previous query that got all the users in
    // the volunteer paragraph assigned to the event
    if (!empty($results) && is_array($results)) {
      $orGroup1 = $query->orConditionGroup();
      foreach($results as $paragraph) {
        $orGroup1->condition('field_event_volunteers.target_id', $paragraph);
      }
      $query->condition($orGroup1);
    }
    elseif (!empty($user)) {
      // @TODO Find a better way to make sure no resutls are returned when a
      //       user is passed but not found in any event. Currently just passing
      //       in a volunteer user id that doesnt exist.
      $query->condition('field_event_volunteers.target_id', '999999999999999999999');
    }
    // Limit the query based on a
    // specified range.
    $query->range($offset, $limit);

    $metadata->addCacheTags($entityType->getListCacheTags());
    $metadata->addCacheContexts($entityType->getListCacheContexts());

    return new QueryConnection($query);
  }
}

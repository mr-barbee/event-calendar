<?php

namespace Drupal\ec_core\Plugin\GraphQL\DataProducer;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\ec_core\Wrappers\QueryConnection;
use GraphQL\Error\UserError;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @DataProducer(
 *   id = "query_taxonomies",
 *   name = @Translation("Load Taxonomy"),
 *   description = @Translation("Loads a list of taxonomies."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("Taxonomy connection")
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
 *     "vocabulary" = @ContextDefinition("string",
 *       label = @Translation("Vocabulary"),
 *       required = FALSE
 *     ),
 *     "id" = @ContextDefinition("integer",
 *       label = @Translation("ID"),
 *       required = FALSE
 *     )
 *   }
 * )
 */
class QueryTaxonomies extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

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
   * Taxonomies constructor.
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
   * @param string $vocabulary
   * @param int $id
   *
   * @return \Drupal\graphql_examples\Wrappers\QueryConnection
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function resolve($offset, $limit, $vocabulary, $id) {
    if ($limit > static::MAX_LIMIT) {
      throw new UserError(sprintf('Exceeded maximum query limit: %s.', static::MAX_LIMIT));
    }

    // Query the event content type based on the selected values.
    $storage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');
    $query = $storage->getQuery()
      ->currentRevision()
      ->accessCheck();
    $query->condition('vid', $vocabulary);
    // If and ID was passed in the just
    // return that taxonomy term else
    // load the full vocabulary.
    if (!empty($id)) {
      $query->condition('tid', $id);
    }

    // Limit the query based on a
    // specified range.
    $query->range($offset, $limit);
    $query->sort('weight');

    return new QueryConnection($query);
  }
}

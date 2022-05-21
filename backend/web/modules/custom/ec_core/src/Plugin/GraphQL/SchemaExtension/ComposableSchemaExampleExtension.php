<?php

namespace Drupal\ec_core\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\GraphQL\Response\ResponseInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;
use Drupal\ec_core\Wrappers\QueryConnection;
use Drupal\taxonomy\Entity\Term;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\user\Entity\User;

/**
 * @SchemaExtension(
 *   id = "composable_extension",
 *   name = "Composable Example extension",
 *   description = "A simple extension that adds node related fields.",
 *   schema = "composable"
 * )
 */
class ComposableSchemaExampleExtension extends SdlSchemaExtensionPluginBase {

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();
    // Get the query and fields needed.
    $this->addQueryFields($registry, $builder);
    $this->addUserFields($registry, $builder);
    $this->addEventFields($registry, $builder);
    $this->addTaxonomyFields($registry, $builder);
    // Add the query connections.
    foreach (['TaxonomyConnection', 'EventConnection'] as $type) {
      // Re-usable connection type fields.
      $this->addConnectionFields($type, $registry, $builder);
    }
  }

  /**
   * @param \Drupal\graphql\GraphQL\ResolverRegistryInterface $registry
   * @param \Drupal\graphql\GraphQL\ResolverBuilder $builder
   */
  protected function addQueryFields(ResolverRegistryInterface $registry, ResolverBuilder $builder): void {
    /**
     * Get the current user data for the logged in user
     */
    $registry->addFieldResolver('Query', 'currentUser',
      $builder->produce('get_user'),
      $builder->produce('entity_load')
        ->map('type', $builder->fromValue('user'))
        ->map('id', $builder->fromParent())
    );
    /**
     * Get the event data for each event types in the system.
     */
    $registry->addFieldResolver('Query', 'event',
      $builder->produce('entity_load')
        ->map('type', $builder->fromValue('node'))
        ->map('bundles', $builder->fromValue(['event']))
        ->map('id', $builder->fromArgument('id'))
    );
    /**
     * An event query to get all the events for a specific range and date
     * time stamp
     */
    $registry->addFieldResolver('Query', 'events',
      $builder->produce('query_events')
        ->map('offset', $builder->fromArgument('offset'))
        ->map('limit', $builder->fromArgument('limit'))
        ->map('date', $builder->fromArgument('date'))
        ->map('range', $builder->fromArgument('range'))
        ->map('user', $builder->fromArgument('user'))
    );
    /**
     * Query the DB for a list of taxonomies.
     */
    $registry->addFieldResolver('Query', 'taxonomies',
      $builder->produce('query_taxonomies')
        ->map('offset', $builder->fromArgument('offset'))
        ->map('limit', $builder->fromArgument('limit'))
        ->map('vocabulary', $builder->fromArgument('vocabulary'))
        ->map('id', $builder->fromArgument('id'))
    );
  }

  /**
   * @param \Drupal\graphql\GraphQL\ResolverRegistryInterface $registry
   * @param \Drupal\graphql\GraphQL\ResolverBuilder $builder
   */
  protected function addUserFields(ResolverRegistryInterface $registry, ResolverBuilder $builder): void {
    $registry->addFieldResolver('User', 'id',
      $builder->produce('get_user'),
      $builder->produce('entity_id')
        ->map('entity', $builder->fromParent())
    );

    $registry->addFieldResolver('User', 'name',
      $builder->compose(
        $builder->produce('get_user'),
        $builder->produce('entity_load')
          ->map('type', $builder->fromValue('user'))
          ->map('id', $builder->fromParent()),
        $builder->produce('entity_label')
          ->map('entity', $builder->fromParent())
      )
    );

    $registry->addFieldResolver('User', 'fullName',
      $builder->compose(
        $builder->produce('get_user'),
        $builder->produce('entity_load')
          ->map('type', $builder->fromValue('user'))
          ->map('id', $builder->fromParent()),
        $builder->produce('property_path')
          ->map('type', $builder->fromValue('entity:user'))
          ->map('value', $builder->fromParent())
          ->map('path', $builder->fromValue('field_user_full_name.value'))
      )
    );

    $registry->addFieldResolver('User', 'email',
      $builder->compose(
        $builder->produce('get_user'),
        $builder->produce('entity_load')
          ->map('type', $builder->fromValue('user'))
          ->map('id', $builder->fromParent()),
        $builder->produce('property_path')
          ->map('type', $builder->fromValue('entity:user'))
          ->map('value', $builder->fromParent())
          ->map('path', $builder->fromValue('mail.value'))
      )
    );

    $registry->addFieldResolver('User', 'phone',
      $builder->compose(
        $builder->produce('get_user'),
        $builder->produce('entity_load')
          ->map('type', $builder->fromValue('user'))
          ->map('id', $builder->fromParent()),
        $builder->produce('property_path')
          ->map('type', $builder->fromValue('entity:user'))
          ->map('value', $builder->fromParent())
          ->map('path', $builder->fromValue('field_user_phone.value'))
      )
    );

    $registry->addFieldResolver('User', 'primary',
      $builder->compose(
        $builder->produce('get_user'),
        $builder->produce('entity_load')
          ->map('type', $builder->fromValue('user'))
          ->map('id', $builder->fromParent()),
        $builder->produce('property_path')
          ->map('type', $builder->fromValue('entity:user'))
          ->map('value', $builder->fromParent())
          ->map('path', $builder->fromValue('field_user_primary_contact.value'))
      )
    );

    $registry->addFieldResolver('User', 'contact',
      $builder->compose(
        $builder->produce('get_user'),
        $builder->produce('entity_load')
          ->map('type', $builder->fromValue('user'))
          ->map('id', $builder->fromParent()),
        $builder->produce('property_path')
          ->map('type', $builder->fromValue('entity:user'))
          ->map('value', $builder->fromParent())
          ->map('path', $builder->fromValue('field_user_contact.value'))
      )
    );

    $registry->addFieldResolver('User', 'categories', $builder->compose(
      $builder->produce('get_user'),
      $builder->produce('entity_load')
        ->map('type', $builder->fromValue('user'))
        ->map('id', $builder->fromParent()),
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:user'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_user_categories')),
      $builder->callback(function ($entity) {
        foreach ( $entity as $taxonomy ) {
          $categories[$taxonomy['target_id']] = Term::load($taxonomy['target_id'])->get('name')->value;
        }
        return $categories ?? [];
      })
    ));

    $registry->addFieldResolver('User', 'experiences', $builder->compose(
      $builder->produce('get_user'),
      $builder->produce('entity_load')
        ->map('type', $builder->fromValue('user'))
        ->map('id', $builder->fromParent()),
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:user'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_user_experience_skills')),
      $builder->callback(function ($entity) {
        foreach ( $entity as $taxonomy ) {
          $experiences[$taxonomy['target_id']] = Term::load($taxonomy['target_id'])->get('name')->value;
        }
        return $experiences ?? [];
      })
    ));

    $registry->addFieldResolver('User', 'note',
      $builder->compose(
        $builder->produce('get_user'),
        $builder->produce('entity_load')
          ->map('type', $builder->fromValue('user'))
          ->map('id', $builder->fromParent()),
        $builder->produce('property_path')
          ->map('type', $builder->fromValue('entity:user'))
          ->map('value', $builder->fromParent())
          ->map('path', $builder->fromValue('field_user_note.value'))
      )
    );

    $registry->addFieldResolver('User', 'verified',
      $builder->compose(
        $builder->produce('get_user'),
        $builder->produce('entity_load')
          ->map('type', $builder->fromValue('user'))
          ->map('id', $builder->fromParent()),
        $builder->produce('property_path')
          ->map('type', $builder->fromValue('entity:user'))
          ->map('value', $builder->fromParent())
          ->map('path', $builder->fromValue('field_user_verified.value'))
      )
    );
  }

  /**
   * @param \Drupal\graphql\GraphQL\ResolverRegistryInterface $registry
   * @param \Drupal\graphql\GraphQL\ResolverBuilder $builder
   */
  protected function addEventFields(ResolverRegistryInterface $registry, ResolverBuilder $builder): void {
    $registry->addFieldResolver('Event', 'id',
      $builder->produce('entity_id')
        ->map('entity', $builder->fromParent())
    );

    $registry->addFieldResolver('Event', 'title',
      $builder->compose(
        $builder->produce('entity_label')
          ->map('entity', $builder->fromParent()),
        $builder->produce('uppercase')
          ->map('string', $builder->fromParent())
      )
    );

    $registry->addFieldResolver('Event', 'body',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:node'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('body.value'))
    );

    $registry->addFieldResolver('Event', 'start', $builder->compose(
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:node:event'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_event_start_date')),
      $builder->callback(function ($entity) {
        // need to adjust the string for the timezone so -00:00 is needed
        $dateTime = new DrupalDateTime($entity[0]['value'] . '-00:00');
        return \Drupal::service('date.formatter')->format($dateTime->getTimestamp(), 'html_datetime');
      })
    ));

    $registry->addFieldResolver('Event', 'end', $builder->compose(
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:node:event'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_event_end_date')),
      $builder->callback(function ($entity) {
                // need to adjust the string for the timezone so -00:00 is needed
        $dateTime = new DrupalDateTime($entity[0]['value'] . '-00:00');
        return \Drupal::service('date.formatter')->format($dateTime->getTimestamp(), 'html_datetime');
      })
    ));

    $registry->addFieldResolver('Event', 'categories', $builder->compose(
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:node:event'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_event_volunteer_categories')),
      $builder->callback(function ($entity) {
        foreach ( $entity as $element ) {
          $paragraph = Paragraph::load( $element['target_id'] );
          if (!empty($paragraph->field_event_category->target_id)) {
            $categories[] = [
              'id' => $paragraph->field_event_category->target_id,
              'category' => Term::load($paragraph->field_event_category->target_id)->get('name')->value,
              'count' => $paragraph->field_event_category_count->value
            ];
          }
        }
        return $categories ?? [];
      })
    ));

    $registry->addFieldResolver('Event', 'volunteers', $builder->compose(
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:node:event'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_event_volunteers')),
      $builder->callback(function ($entity) {
        foreach ( $entity as $element ) {
          // Load the paragraph and user.
          $paragraph = Paragraph::load( $element['target_id'] );
          if (!empty($paragraph->field_event_volunteer->target_id)) {
            $user = User::load($paragraph->field_event_volunteer->target_id);
            $category = !empty(Term::load($paragraph->field_event_category->target_id)) ? Term::load($paragraph->field_event_category->target_id)->get('name')->value : '';
            // And the user to the array.
            if (!empty($user)) {
              $volunteers[] = [
                'id' => $paragraph->field_event_volunteer->target_id,
                'volunteer' => $user->getDisplayName(),
                'category' => $category,
                'hours' => $paragraph->field_event_volunteer_hrs_avail->value,
                'note' => $paragraph->field_event_volunteer_notes->value
              ];
            }
          }
        }
        return $volunteers ?? [];
        })
    ));
  }

  /**
   * @param \Drupal\graphql\GraphQL\ResolverRegistryInterface $registry
   * @param \Drupal\graphql\GraphQL\ResolverBuilder $builder
   */
  protected function addTaxonomyFields(ResolverRegistryInterface $registry, ResolverBuilder $builder): void {
    /**
     * Get the Taxonomy fields.
     */
    $registry->addFieldResolver('Taxonomy', 'id',
      $builder->produce('entity_id')
        ->map('entity', $builder->fromParent())
    );

    $registry->addFieldResolver('Taxonomy', 'name',
      $builder->compose(
        $builder->produce('entity_label')
          ->map('entity', $builder->fromParent())
      )
    );
  }

  /**
   * @param string $type
   * @param \Drupal\graphql\GraphQL\ResolverRegistryInterface $registry
   * @param \Drupal\graphql\GraphQL\ResolverBuilder $builder
   */
  protected function addConnectionFields($type, ResolverRegistryInterface $registry, ResolverBuilder $builder): void {
    $registry->addFieldResolver($type, 'total',
      $builder->callback(function (QueryConnection $connection) {
        return $connection->total();
      })
    );

    $registry->addFieldResolver($type, 'items',
      $builder->callback(function (QueryConnection $connection) {
        return $connection->items();
      })
    );
  }
}

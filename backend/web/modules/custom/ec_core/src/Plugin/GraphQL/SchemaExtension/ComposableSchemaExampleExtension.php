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

    /**
     * Get the current user data for the logged in user
     */
    $registry->addFieldResolver('Query', 'currentUser', $builder->compose(
      $builder->produce('get_user'),
      $builder->produce('entity_load')
        ->map('type', $builder->fromValue('user'))
        ->map('id', $builder->fromParent()),
      $builder->callback(function ($entity) {
        foreach($entity->get('field_user_categories')->getValue() as $taxonamy) {
          $categories[$taxonamy['target_id']] = Term::load($taxonamy['target_id'])->get('name')->value;
        }
        foreach($entity->get('field_user_experience_skills')->getValue() as $taxonamy) {
          $experiences[$taxonamy['target_id']] = Term::load($taxonamy['target_id'])->get('name')->value;
        }
        return [
          'id' => $entity->id(),
          'name' => $entity->getDisplayName(),
          'fullName' => $entity->field_user_full_name->value,
          'phone' => $entity->field_user_phone->value,
          'email' => $entity->field_user_primary_contact->value,
          'contact' => $entity->field_user_contact->value,
          'categories' => $categories ?? [],
          'experiences' => $experiences ?? [],
          'note' => $entity->field_user_note->value
        ];
      })
    ));








    /**
     * Get the event data for each events types in the system.
     */
    $registry->addFieldResolver('Query', 'event',
      $builder->produce('entity_load')
        ->map('type', $builder->fromValue('node'))
        ->map('bundles', $builder->fromValue(['event']))
        ->map('id', $builder->fromArgument('id'))
    );

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

    $registry->addFieldResolver('Event', 'startDate', $builder->compose(
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:node:event'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_event_start_date')),
      $builder->callback(function ($entity) {
        // need to adjust the string for the timezone so -00:00 is needed
        $dateTime = new DrupalDateTime($entity[0]['value'] . '-00:00');
        return \Drupal::service('date.formatter')->format($dateTime->getTimestamp(), 'long');
      })
    ));

    $registry->addFieldResolver('Event', 'endDate', $builder->compose(
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:node:event'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_event_end_date')),
      $builder->callback(function ($entity) {
                // need to adjust the string for the timezone so -00:00 is needed
        $dateTime = new DrupalDateTime($entity[0]['value'] . '-00:00');
        return \Drupal::service('date.formatter')->format($dateTime->getTimestamp(), 'long');
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
          $categories[] = [
            'category' => Term::load($paragraph->field_event_category->target_id)->get('name')->value,
            'count' => $paragraph->field_event_category_count->value
          ];
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
          $user = User::load($paragraph->field_event_volunteer->target_id);
          // And the user to the array.
          if (!empty($user)) {
            $volunteers[] = [
              'volunteer' => $user->getDisplayName(),
              'hours' => $paragraph->field_event_volunteer_hrs_avail->value,
              'note' => $paragraph->field_event_volunteer_notes->value
            ];
          }
        }
        return $volunteers ?? [];
        })
    ));



    /**
     * An event query to get all the events for a specific range and date
     * time stamp
     */
    $registry->addFieldResolver('Query', 'events',
      $builder->produce('query_events')
        ->map('offset', $builder->fromArgument('offset'))
        ->map('limit', $builder->fromArgument('limit'))
    );

    $registry->addFieldResolver('EventConnection', 'total',
      $builder->callback(function (QueryConnection $connection) {
        return $connection->total();
      })
    );

    $registry->addFieldResolver('EventConnection', 'items',
      $builder->callback(function (QueryConnection $connection) {
        return $connection->items();
      })
    );

    // Response type resolver.
    // $registry->addTypeResolver('Response', [
    //   __CLASS__,
    //   'resolveResponse',
    // ]);
  }

  /**
   * Resolves the response type.
   *
   * @param \Drupal\graphql\GraphQL\Response\ResponseInterface $response
   *   Response object.
   *
   * @return string
   *   Response type.
   *
   * @throws \Exception
   *   Invalid response type.
   */
  // public static function resolveResponse(ResponseInterface $response): string {
  //   // Resolve content response.
  //   if ($response instanceof ArticleResponse) {
  //     return 'ArticleResponse';
  //   }
  //   throw new \Exception('Invalid response type.');
  // }

}

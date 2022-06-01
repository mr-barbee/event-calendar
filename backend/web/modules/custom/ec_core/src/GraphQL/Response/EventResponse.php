<?php

namespace Drupal\ec_core\GraphQL\Response;

use Drupal\Core\Entity\EntityInterface;
use Drupal\graphql\GraphQL\Response\Response;

/**
 * Type of response used when an event is returned.
 */
class EventResponse extends Response {

  /**
   * The event to be served.
   *
   * @var \Drupal\Core\Entity\EntityInterface|null
   */
  protected $event;

  /**
   * Sets the content.
   *
   * @param \Drupal\Core\Entity\EntityInterface|null $event
   *   The event to be served.
   */
  public function setEvent(?EntityInterface $event): void {
    $this->event = $event;
  }

  /**
   * Gets the event to be served.
   *
   * @return \Drupal\Core\Entity\EntityInterface|null
   *   The event to be served.
   */
  public function event(): ?EntityInterface {
    return $this->event;
  }

}

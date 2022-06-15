<?php

namespace Drupal\ec_core\GraphQL\Response;

use Drupal\Core\Session\AccountInterface;
use Drupal\graphql\GraphQL\Response\Response;

/**
 * Type of response used when an user is returned.
 */
class UserResponse extends Response {

  /**
   * The user to be served.
   *
   * @var \Drupal\Core\Session\AccountInterface|null
   */
  protected $user;

  /**
   * Sets the content.
   *
   * @param \Drupal\Core\Session\AccountInterface|null $user
   *   The user to be served.
   */
  public function setUser(?AccountInterface $user): void {
    $this->user = $user;
  }

  /**
   * Gets the user to be served.
   *
   * @return \Drupal\Core\Session\AccountInterface|null
   *   The user to be served.
   */
  public function user(): ?AccountInterface {
    return $this->user;
  }

}

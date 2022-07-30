<?php

namespace Drupal\core_api\EventSubscriber;

use Drupal\Core\Messenger\MessengerInterface;
use Drupal\social_auth\Event\UserEvent;
use Drupal\social_auth\Event\SocialAuthEvents;
use Drupal\social_auth\Event\UserFieldsEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Reacts on Social Auth events.
 */
class SocialAuthSubscriber implements EventSubscriberInterface {

  /**
   * The messenger service.
   *
   * @var \Drupal\Core\Messenger\MessengerInterface
   */
  private $messenger;

  /**
   * SocialAuthSubscriber constructor.
   *
   * @param \Drupal\Core\Messenger\MessengerInterface $messenger
   *   The messenger service.
   */
  public function __construct(MessengerInterface $messenger) {
    $this->messenger = $messenger;
  }

  /**
   * {@inheritdoc}
   *
   * Returns an array of event names this subscriber wants to listen to.
   * For this case, we are going to subscribe for user creation and login
   * events and call the methods to react on these events.
   */
  public static function getSubscribedEvents() {
    $events[SocialAuthEvents::USER_CREATED] = ['onUserCreated'];
    $events[SocialAuthEvents::USER_LOGIN] = ['onUserLogin'];
    $events[SocialAuthEvents::USER_FIELDS] = ['onUserFields'];

    return $events;
  }

  /**
   * Alters the user name.
   *
   * @param \Drupal\social_auth\Event\UserEvent $event
   *   The Social Auth user event object.
   */
  public function onUserCreated(UserEvent $event) {
    $user = $event->getUser();
    // Adds a prefix with the implementer id on username.
    $user->setUsername($user->getDisplayName());
    // set the roles for the user and primay contact.
    $user->addRole('volunteer');
    $user->set('field_user_primary_contact', 'e');
    // We want to add which social login the user used to sign in.
    $user->set('field_user_active_social_login', $event->getPluginId());
    // Update the verification setting for the user.
    $user->set('field_user_verified', TRUE);
    // We want to save
    // user.
    $user->save();

  }

  /**
   * Sets a drupal message when a user logs in.
   *
   * @param \Drupal\social_auth\Event\UserEvent $event
   *   The Social Auth user event object.
   */
  public function onUserLogin(UserEvent $event) {
    $user = $event->getUser();
    // We want to add which social login the user used to sign in.
    $user->set('field_user_active_social_login', $event->getPluginId());
    // We want to save
    // user.
    $user->save();
  }


  /**
   * Populates name fields before user creation.
   *
   * @param \Drupal\social_auth\Event\UserFieldsEvent $event
   *   The Social Auth user event object.
   */
  public function onUserFields(UserFieldsEvent $event) {
    $fields = $event->getUserFields();
    $user = $event->getSocialAuthUser();
    $first_name = $user->getFirstName();
    $last_name = $user->getLastName();
    $fullname = $user->getName();
    list($first_name_fallback, $last_name_fallback) = explode(' ', $fullname);

    if (!empty($first_name)) {
      $fields['field_user_full_name'] = ucfirst($first_name) . ' ' . ucfirst($last_name);
    }
    elseif (!empty($first_name_fallback)) {
      $fields['field_user_full_name'] = ucfirst($first_name_fallback) . ' ' . ucfirst($last_name_fallback);;
    }

    $event->setUserFields($fields);
  }
}

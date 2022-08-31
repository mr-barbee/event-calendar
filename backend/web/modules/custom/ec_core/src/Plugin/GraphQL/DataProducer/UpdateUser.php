<?php

namespace Drupal\ec_core\Plugin\GraphQL\DataProducer;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\ec_core\GraphQL\Response\UserResponse;
use Drupal\user\Entity\User;
use Symfony\Component\DependencyInjection\ContainerInterface;
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
      // We want to verify the data the contact information.
      // Reasons why we need to verify the contact info.
      $needs_verification = FALSE;
      $primary_contact = $user->get('field_user_primary_contact')->getValue()[0]['value'];
      // 1. Perfered primary contact was changed.
      if ($primary_contact !== $data['primary']) {
        $needs_verification = TRUE;
      }
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
      // if the password is set and the social login is set as well then this is a social login update.
      $social_login_update = !empty($data['pass']) && !empty($user->get('field_user_active_social_login')->getValue()[0]['value']);
      // We only want to update the username, password, and email if the current password is set.
      // We only change these if the data is set.
      // We also check if the social login is set bc a current password wouldnt be set either.
      if (!empty($data['currPass']) || $social_login_update) {
        // Check to see if the current password is correct and the user was a social login user.
        if (!$social_login_update && !$this->passwordHasher->check($data['currPass'], $user->getPassword())) {
          throw new \Exception('Your current password is not correct.');
        }
        else {
          // We want to remove the social media login flag.
          $user->set('field_user_active_social_login', null);
          // make sure username is set and is changing.
          if (!empty($data['name']) && $user->getAccountName() !== $data['name']) {
            $ids = \Drupal::entityQuery('user')
                ->condition('name', $data['name'])
                ->range(0, 1)
                ->execute();
            if (!empty($ids)) {
              throw new \Exception('The username ' . $data['name'] . ' is already taken.');
            }
            // Set the username.
            $user->setUsername($data['name']);
          }
          // 2. The users account was never verified.
          // 3. The user updated there primary contact info.
          if (($data['primary'] === 'e' && $user->getEmail() !== $data['email']) ||
              ($data['primary'] === 'p' && $user->get('field_user_phone')->getValue()[0]['value'] !== $data['phone'])) {
            $needs_verification = TRUE;
          }
          // Check the plain password with the
          // hashed password from db
          if (!empty($data['pass'])) {
            $user->setPassword($data['pass']);
          }
          // make sure email is set and is changing.
          if (!empty($data['email']) && $user->getEmail() !== $data['email']) {
            $ids = \Drupal::entityQuery('user')
                ->condition('mail', $data['email'])
                ->range(0, 1)
                ->execute();
            if (!empty($ids)) {
              throw new \Exception('The email address ' . $data['email'] . ' is already taken.');
            }
            // Set the username.
            $user->setEmail($data['email']);
          }
        }
      }
      // make sure email is set and is changing.
      if (!empty($data['phone']) && $user->get('field_user_phone')->getValue()[0]['value'] !== $data['phone']) {
        $ids = \Drupal::entityQuery('user')
            ->condition('field_user_phone', $data['phone'])
            ->range(0, 1)
            ->execute();
        if (!empty($ids)) {
          throw new \Exception('The phone number ' . $data['phone'] . ' is already taken.');
        }
        // This needs to be done last bc of the verification.
        $user->set('field_user_phone', $data['phone']);
      }
      // If the needs verification status is set
      // then we need to verify the user.
      if ($needs_verification) {
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
        $this->t($message ?? 'There was an error trying to save the user')
      );
    }

    return $response;
  }

}

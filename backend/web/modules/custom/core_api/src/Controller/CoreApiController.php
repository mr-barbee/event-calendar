<?php
/**
 * @file
 * Contains \Drupal\core_api\Controller\CoreApiController.
 */

namespace Drupal\core_api\Controller;

use Drupal\core_api\CoreApiHandler;
use Drupal\core_api\Controller\TwilioApiController;
use Drupal\user\Entity\User;
use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Drupal\paragraphs\Entity\Paragraph;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Controller routines for core_api routes.
 */
class CoreApiController extends ControllerBase {

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $currentUser;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
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
  public function __construct(AccountInterface $current_user) {
    $this->currentUser = $current_user;
  }
  /**
   * [updateUserPassword description]
   * @param  Request $request [description]
   * @return [type]           [description]
   */
  public function registerUserAccount(Request $request) {
    $status = 200;
    $response = [];

    try {
      CoreApiHandler::validate_api_request($request);
      // Get the data from the request.
      $data = json_decode($request->getContent(), TRUE);
      // Update the request with the data.
      $request->request->replace( is_array( $data ) ? $data : [] );
      if (isset($data['name']) && isset($data['email'])) {
        // We want to check to make sure the email and
        // username hasnt been take.
        $query = \Drupal::entityQuery('user');
        $group = $query
          ->orConditionGroup()
          ->condition('name', $data['name'])
          ->condition('mail', $data['email']);
        $ids = $query
          ->condition($group)
          ->range(0, 1)
          ->execute();
        if (!empty($ids)) {
          $response = ['error_message' => 'Username or email already taken.', 'status' => 'error'];
          throw new \Exception();
        }
        // Ensure we have a valid user name.
        $valid_name = user_validate_name($data['name']);
        if (!empty($valid_name)) {
          $response = ['error_message' => $valid_name, 'status' => 'error'];
          throw new \Exception();
        }
        // Ensur the email address is valid.
        if (!\Drupal::service('email.validator')->isValid($data['email'])) {
          $response = ['error_message' => 'The email address is not valid.', 'status' => 'error'];
          throw new \Exception();
        }
        // Make the user.
        $user = User::create();
        $user->setUsername($data['name']);
        $user->setEmail($data['email']);
        if (!empty($data['fullName'])) {
          $user->set('field_user_full_name', $data['fullName']);
        }
        $user->addRole('volunteer');
        $user->set('field_user_primary_contact', 'e');
        $user->enforceIsNew();
        $user->activate();
        $result = $user->save();
        // If the use was saved successfully then
        // we want to send a email verification
        // to Twilio API.
        if ($result) {
          // Send out the twilio verification email.
          $twilio = new TwilioApiController();
          if ($twilio_response = $twilio->sendVerificationToken($user->id(), 'new_user')) {
            $response = [
              'uid' => $user->id(),
              'valid' => $twilio_response['valid'],
              'token' => $twilio_response['token'],
              'status' => $twilio_response['status']
            ];
          }
          else {
            $response = ['error_message' => 'There was an issue sending verification email. Please contact site administator.', 'status' => 'error'];
            throw new \Exception();
          }
        }
        else {
          throw new \Exception();
        }
      }
      else {
        $response = ['error_message' => 'Missing Fields', 'status' => 'error'];
        throw new \Exception();
      }
    }
    catch (AccessDeniedHttpException $e) {
      $response = ['error_message' => 'You dont have the priviledges to access this url', 'status' => 'error'];
      $status = 403;
    }
    catch (\Exception $e) {
      if (empty($response['error_message'])) {
        \Drupal::logger(__CLASS__)->error($e->getMessage());
        $response = ['error_message' => 'We\'re currenlty experiency some technical difficulties.', 'status' => 'error'];
      }
      $status = 400;
    }

    // return the response.
    return new JsonResponse($response, $status);
  }

  /**
   * [updateUserPassword description]
   * @param  Request $request [description]
   * @return [type]           [description]
   */
  public function updateUserPassword(Request $request) {
    $status = 200;
    $response = [];

    try {
      CoreApiHandler::validate_api_request($request);
      // Get the data from the request.
      $data = json_decode($request->getContent(), TRUE);
      // Update the request with the data.
      $request->request->replace( is_array( $data ) ? $data : [] );

      $tempstore = \Drupal::service('tempstore.private')->get('core_api');

      if (isset($data['uid']) && isset($data['password']) && isset($data['sid']) && $tempstore->get('verification_token') == $data['sid']) {
        $user = User::load($data['uid']);
        $user->setPassword($data['password']);

        // Save the user.
        $is_saved = $user->save();
        // Delete the verification token.
        $tempstore->delete('verification_token');
        $response = [
          'valid' => $is_saved
        ];
      }
      else {
        $response = ['error_message' => 'Invalid Parameters.', 'status' => 'error'];
        throw new \Exception();
      }
   }
   catch (\Exception $e) {
     if (empty($response['error_message'])) {
       \Drupal::logger(__CLASS__)->error($e->getMessage());
       $response = ['error_message' => 'We\'re currenlty experiency some technical difficulties. Please contact site administrator.', 'status' => 'error'];
     }
     $status = 400;
   }

   // return the response.
   return new JsonResponse($response, $status);
  }

  /**
   * [locateUserAndSendVerification description]
   * @param  Request $request [description]
   * @return [type]           [description]
   */
  public function locateUserAndSendVerification(Request $request) {
    $status = 200;
    $response = [];

    try {
      CoreApiHandler::validate_api_request($request);
      // Get the data from the request.
      $data = json_decode($request->getContent(), TRUE);
      // Update the request with the data.
      $request->request->replace( is_array( $data ) ? $data : [] );
      if (isset($data['email']) || isset($data['name'])) {
        // Gather the user email.
        $query = \Drupal::entityQuery('user');
        if (!empty($data['name'])) $query->condition('name', $data['name']);
        else $query->condition('mail', $data['email']);
        $id = $query->range(0, 1)
          ->execute();
        $id = reset($id);
        if (empty($id)) {
          $response = ['error_message' => 'Cannot locate your account. Please contact site administator.', 'status' => 'error'];
          throw new \Exception();
        }
        else {
          // Send out the twilio verification email.
          $twilio = new TwilioApiController();
          if ($twilio_response = $twilio->sendVerificationToken($id, 'password_reset')) {
            $response = [
              'uid' => $id,
              'valid' => $twilio_response['valid'],
              'token' => $twilio_response['token'],
              'status' => $twilio_response['status']
            ];
          }
          else {
            $response = ['error_message' => 'There was an issue sending verification email. Please contact site administator.', 'status' => 'error'];
            throw new \Exception();
          }
        }
      }
      else {
        $response = ['error_message' => 'Invalid Parameters.', 'status' => 'error'];
        throw new \Exception();
      }
    }
    catch (\Exception $e) {
     if (empty($response['error_message'])) {
       \Drupal::logger(__CLASS__)->error($e->getMessage());
       $response = ['error_message' => 'We\'re currenlty experiency some technical difficulties. Please contact site administrator.', 'status' => 'error'];
     }
     $status = 400;
    }

   // return the response.
   return new JsonResponse($response, $status);
  }

  /**
   * [disableUserAccount description]
   * @param  Request $request               [description]
   * @return [type]           [description]
   */
  public function disableUserAccount(Request $request) {
    $status = 200;
    $response = [];

    try {
      CoreApiHandler::validate_api_request($request);
      if ($this->currentUser->isAnonymous()) throw new AccessDeniedHttpException;
      $user = User::load($this->currentUser->id());
      $roles = $user->getRoles();
      // this should only be accessed by the volunteer roles.
      if (!in_array('volunteer', $roles)) throw new AccessDeniedHttpException;
      // Block the users account.
      user_cancel([], $this->currentUser->id(), 'user_cancel_block');
      // Invoke the Batch API and execute.
      $batch = &batch_get();
      $batch['progressive'] = FALSE;
      batch_process();
      $response = [
        'success' => TRUE
      ];
    }
    catch (AccessDeniedHttpException $e) {
      $response = ['error_message' => 'You dont have the priviledges to access this url.', 'status' => 'error'];
      $status = 403;
    }
    catch (\Exception $e) {
      if (empty($response['error_message'])) {
        \Drupal::logger(__CLASS__)->error($e->getMessage());
        $response = ['error_message' => 'We\'re currenlty experiency some technical difficulties. Please contact site administrator.', 'status' => 'error'];
      }
      $status = 400;
    }
    // return the response.
    return new JsonResponse($response, $status);
  }

  /**
   * [veritySession description]
   * @param  Request $request               [description]
   * @return [type]           [description]
   */
  public function veritySession(Request $request) {
    $status = 200;
    $response = [ 'is_authenticated' => FALSE ];

    try {
      CoreApiHandler::validate_api_request($request);
      if ($this->currentUser->isAuthenticated()) $response = [ 'is_authenticated' => TRUE ];
    }
    catch (\Exception $e) {
      if (empty($response['error_message'])) {
        \Drupal::logger(__CLASS__)->error($e->getMessage());
        $response = ['error_message' => 'We\'re currenlty experiency some technical difficulties. Please contact site administrator.', 'status' => 'error'];
      }
      $status = 400;
    }
    // return the response.
    return new JsonResponse($response, $status);
  }

  /**
   * [retrieveBlockQuotes description]
   * @param  Request $request               [description]
   * @return [type]           [description]
   */
  public function retrieveBlockQuotes(Request $request) {
    $status = 200;
    $response = [];

    try {
      CoreApiHandler::validate_api_request($request);
      $nids = \Drupal::entityQuery('node')->condition('type','block_quotes')->execute();
      $nodes = Node::loadMultiple($nids);
      $node = reset($nodes);
      $block_quotes = [];
      $field_block_quotes = $node->get('field_block_quotes')->getValue();
      foreach ($field_block_quotes as $key => $block_quote) {
        $paragraph = Paragraph::load($block_quote['target_id']);
        \Drupal::logger('module_name')->notice('<pre><code>' . print_r($paragraph->get('field_block_quote_quote')->getValue()[0], TRUE) . '</code></pre>' );
        // Retrieve the block quotes.
        $block_quotes[] = [
          'quote' => $paragraph->get('field_block_quote_quote')->getValue()[0]['value'],
          'meaning' => $paragraph->get('field_block_quote_meaning')->getValue()[0]['value'],
          'author' => $paragraph->get('field_block_quote_author')->getValue()[0]['value']
        ];
      }
      $response = [ 'block_quotes' => $block_quotes ];
    }
    catch (AccessDeniedHttpException $e) {
      $response = ['error_message' => 'You dont have the priviledges to access this url.', 'status' => 'error'];
      $status = 403;
    }
    catch (\Exception $e) {
      if (empty($response['error_message'])) {
        \Drupal::logger(__CLASS__)->error($e->getMessage());
        $response = ['error_message' => 'We\'re currenlty experiency some technical difficulties. Please contact site administrator.', 'status' => 'error'];
      }
      $status = 400;
    }
    // return the response.
    return new JsonResponse($response, $status);
  }

}

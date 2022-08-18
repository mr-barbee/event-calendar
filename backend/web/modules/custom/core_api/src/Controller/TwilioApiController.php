<?php
/**
 * @file
 * Contains \Drupal\core_api\Controller\TwilioApiController.
 */

namespace Drupal\core_api\Controller;

use Drupal\core_api\CoreApiHandler;
use Drupal\user\Entity\User;
use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

use Twilio\Rest\Client;

/**
 * Controller routines for core_api routes.
 */
class TwilioApiController extends ControllerBase {

  /**
   * Config settings.
   */
  private function getConfigs() {
    return \Drupal::config('core_api_settings_form.settings');
  }

  /**
   * [fetchVerifcationBySid description]
   * @param  [type] $sid               [description]
   * @return [type]      [description]
   */
  public function fetchVerifcationBySid($sid) {
    try {
      $config = $this->getConfigs();
      // Find your Account SID and Auth Token at twilio.com/console
      // and set the environment variables. See http://twil.io/secure
      $account_sid = $config->get('core_api_settings_form.account_sid');
      $token = $config->get('core_api_settings_form.auth_token');
      $service_id = $config->get('core_api_settings_form.service_id');

      $twilio = new Client($account_sid, $token);
      $verification = $twilio->verify->v2->services($service_id)
                                         ->verifications($sid)
                                         ->fetch();

      \Drupal::logger('module_name')->notice('<pre><code>' . print_r($verification, TRUE) . '</code></pre>' );
      return $verification;
    }
    catch (\Exception $e) {
      \Drupal::logger(__CLASS__)->error($e->getMessage());
    }
    return FALSE;
  }

  /**
   * [sendVerificationToken description]
   * @param  [type] $data               [description]
   * @return [type]       [description]
   */
  public function sendVerificationToken($uid, $email_template = FALSE) {
    try {
      $user = User::load($uid);
      if (empty($user)) throw new \Exception('uid is missing');
      $config = $this->getConfigs();
      // Find your Account SID and Auth Token at twilio.com/console
      // and set the environment variables. See http://twil.io/secure
      $account_sid = $config->get('core_api_settings_form.account_sid');
      $token = $config->get('core_api_settings_form.auth_token');
      $service_id = $config->get('core_api_settings_form.service_id');
      $options = ['locale' => 'en'];

      $primary_contact = $user->get('field_user_primary_contact')->getValue()[0]['value'];
      if ($primary_contact == 'p') {
        $type = 'sms';
        // @TODO allow users to update the country code.
        $contact = '+1' . $user->get('field_user_phone')->getValue()[0]['value'];
      }
      else {
        $type = 'email';
        $contact = $user->getEmail();
        $options['channelConfiguration'] = [
          'substitutions' => [
            'uid' => $uid
          ]
        ];

        if ($email_template) {
          switch ($email_template) {
            case 'new_user':
              $options['channelConfiguration']['template_id'] = $config->get('core_api_settings_form.verify_email_template_id');
              break;
            case 'password_reset':
              $options['channelConfiguration']['template_id'] = $config->get('core_api_settings_form.reset_email_template_id');
              break;
          }
        }
      }

      $twilio = new Client($account_sid, $token);
      $verification = $twilio->verify->v2->services($service_id)
                                   ->verifications
                                   ->create( $contact, $type, $options);

      // If the status is not pending that means
      // something went wrong with the call.
      if ($verification->status == 'pending') {
        return [
          'valid' => $verification->valid,
          'token' => $verification->sid,
          'status' => $verification->status,
        ];
      }
    }
    catch (\Exception $e) {
      \Drupal::logger(__CLASS__)->error($e->getMessage());
    }

    return FALSE;
  }

  /**
   * [twilioTokenRequest description]
   * @param  Request $request [description]
   * @return [type]           [description]
   */
  public function twilioTokenRequest(Request $request) {
    $status = 200;
    $response = [];

    try {
      // Here we want to check the IP whitelist to make sure the
      // IP address is valid for access to this method.
      CoreApiHandler::validate_api_request($request);

      $data = json_decode($request->getContent(), TRUE);
      // Update the request with the data.
      $request->request->replace( is_array( $data ) ? $data : [] );
      if (isset($data['uid'])) {
        // Call the Twilio API.
        if ($twilio_response = $this->sendVerificationToken($data['uid'])) {
          $response = [
            'valid' => $twilio_response['valid'],
            'token' => $twilio_response['token'],
            'status' => $twilio_response['status']
          ];
        }
        else {
          $response = ['error_message' => 'There was an issue sending verification token. Please contact site administator.', 'status' => 'error'];
          throw new \Exception();
        }
      }
      else {
        $response = ['error_message' => 'Verify contact is missing', 'status' => 'error'];
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
   * [checkVerificationToken description]
   * @param  Request $request [description]
   * @return [type]           [description]
   */
  public function checkVerificationToken(Request $request) {
    $status = 200;
    $response = [];
    $config = $this->getConfigs();

    try {
      // Here we want to check the IP whitelist to make sure the
      // IP address is valid for access to this method.
      CoreApiHandler::validate_api_request($request);

      $data = json_decode($request->getContent(), TRUE);
      // Update the request with the data.
      $request->request->replace( is_array( $data ) ? $data : [] );
      if (isset($data['code']) && isset($data['uid']) && $user = User::load($data['uid'])) {
        // Find your Account SID and Auth Token at twilio.com/console
        // and set the environment variables. See http://twil.io/secure
        $account_sid = $config->get('core_api_settings_form.account_sid');
        $token = $config->get('core_api_settings_form.auth_token');
        $service_id = $config->get('core_api_settings_form.service_id');

        if (empty($data['sid'])) {
          $primary_contact = $user->get('field_user_primary_contact')->getValue()[0]['value'];
          // @TODO allow users to update the country code.
          $to = $primary_contact == 'p' ? '+1' . $user->get('field_user_phone')->getValue()[0]['value'] : $user->getEmail();
          $options = ['to' => $to];
        }
        else {
          // Allow user to verfiy by Sid.
          $options = ['verificationSid' => $data['sid']];
        }
        $options['code'] = $data['code'];
        $twilio = new Client($account_sid, $token);
        $verification_check = $twilio->verify->v2->services($service_id)
                                          ->verificationChecks
                                          ->create($options);

        $status = $verification_check->status == 'approved' ? 200 : 400;
        // @TODO Move this to anoter endpoint.
        if ($verification_check->status == 'approved') {
          // Update the verification setting for the user.
          $user->set('field_user_verified', TRUE);
          // Save the user.
          $user->save();
          $tempstore = \Drupal::service('tempstore.private')->get('core_api');
          $tempstore->set('verification_token', $verification_check->sid);
        }

        $response = [
          'valid' => $verification_check->valid,
          'token' => $verification_check->sid,
          'status' => $verification_check->status,
        ];
      }
      else {
        $response = ['error_message' => 'Missing Parameters', 'status' => 'error'];
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
}

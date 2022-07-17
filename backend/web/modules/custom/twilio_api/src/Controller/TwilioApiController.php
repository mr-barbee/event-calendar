<?php
/**
 * @file
 * Contains \Drupal\twilio_api\Controller\TwilioApiController.
 */

namespace Drupal\twilio_api\Controller;

use Drupal\twilio_api\TwilioAPIHandler;
use Drupal\user\Entity\User;
use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

use Twilio\Rest\Client;

/**
 * Controller routines for twilio_api routes.
 */
class TwilioApiController extends ControllerBase {

  /**
   * Config settings.
   */
  protected function getConfigs() {
    return \Drupal::config('twilio_api_settings_form.settings');
  }

  /**
   * [sendVerificationToken description]
   * @param  Request $request [description]
   * @return [type]           [description]
   */
  public function sendVerificationToken(Request $request) {
    $status = 200;
    $response = [];
    $config = $this->getConfigs();

    // Here we want to check the IP whitelist to make sure the
    // IP address is valid for access to this method.
    $api_error = TwilioApiHandler::validate_api_request($request);
    if (isset($api_error['status']) && $api_error['status'] == 'FAILURE'){
      throw new Exception;
    }

    $data = json_decode($request->getContent(), TRUE);
    // Update the request with the data.
    $request->request->replace( is_array( $data ) ? $data : [] );
    if (isset($data['contact'])) {
      try {
        // Find your Account SID and Auth Token at twilio.com/console
        // and set the environment variables. See http://twil.io/secure
        $account_sid = $config->get('twilio_api_settings_form.account_sid');
        $token = $config->get('twilio_api_settings_form.auth_token');
        $service_id = $config->get('twilio_api_settings_form.service_id');

        $twilio = new Client($account_sid, $token);
        $verification = $twilio->verify->v2->services($service_id)
                                     ->verifications
                                     ->create( $data['contact'], $data['type'], ["locale" => "en"]);

        // If the status is not pending that means
        // something went wrong with the call.
        $status = $verification->status == 'pending' ? 200 : 400;
        $response = [
          'valid' => $verification->valid,
          'token' => $verification->sid,
          'status' => $verification->status,
        ];
      }
      catch (\Exception $e) {
        \Drupal::logger(__CLASS__)->error($e->getMessage());
        $response = ['error_message' => 'We\'re currenlty experiency some technical difficulties.', 'status' => 'error'];
        $status = 400;
      }
    }
    else {
      $response = ['error_message' => 'Verify contact is missing', 'status' => 'error'];
      $status = 400;
    }

    // return the response.
    return new JsonResponse($response, $status);

  }

  /**
   * [sendVerificationToken description]
   * @param  Request $request [description]
   * @return [type]           [description]
   */
  public function checkVerificationToken(Request $request) {
    $status = 200;
    $response = [];
    $config = $this->getConfigs();

    // Here we want to check the IP whitelist to make sure the
    // IP address is valid for access to this method.
    $api_error = TwilioApiHandler::validate_api_request($request);
    if (isset($api_error['status']) && $api_error['status'] == 'FAILURE'){
      throw new AccessDeniedHttpException;
    }

    $data = json_decode($request->getContent(), TRUE);
    // Update the request with the data.
    $request->request->replace( is_array( $data ) ? $data : [] );
    if (isset($data['sid']) && isset($data['code'])) {
      try {
        // Find your Account SID and Auth Token at twilio.com/console
        // and set the environment variables. See http://twil.io/secure
        $account_sid = $config->get('twilio_api_settings_form.account_sid');
        $token = $config->get('twilio_api_settings_form.auth_token');
        $service_id = $config->get('twilio_api_settings_form.service_id');

        $twilio = new Client($account_sid, $token);
        $verification_check = $twilio->verify->v2->services($service_id)
                                          ->verificationChecks
                                          ->create($data['code'],
                                                   ["verificationSid" => $data['sid']]
                                          );

        $status = $verification_check->status == 'approved' ? 200 : 400;



        if ($data['user_id'] && $verification_check->status == 'approved') {
          $user = User::load($data['user_id']);
          // Update the verification setting for the user.
          $user->set('field_user_verified', TRUE);
          // Save the user.
          $user->save();
        }




        $response = [
          'valid' => $verification_check->valid,
          'token' => $verification_check->sid,
          'status' => $verification_check->status,
        ];






      }
      catch (\Exception $e) {
        \Drupal::logger(__CLASS__)->error($e->getMessage());
        $response = ['error_message' => 'We\'re currenlty experiency some technical difficulties.', 'status' => 'error'];
        $status = 400;
      }
    }
    else {
      $response = ['error_message' => 'Contact or Code is missing', 'status' => 'error'];
      $status = 400;
    }

    // return the response.
    return new JsonResponse($response, $status);
  }
}

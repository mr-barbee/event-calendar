<?php
/**
 * @file
 * Contains \Drupal\twilio_api\Controller\TwilioApiController.
 */

namespace Drupal\twilio_api\Controller;

use Drupal\twilio_api\TwilioAPIHandler;

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
   * [sendVerificationToken description]
   * @param  Request $request [description]
   * @return [type]           [description]
   */
  public function sendVerificationToken(Request $request) {
    $status = 200;
    $response = [];

    // Here we want to check the IP whitelist to make sure the
    // IP address is valid for access to this method.
    $api_error = TwilioApiHandler::validate_api_request($request);
    if (isset($api_error['status']) && $api_error['status'] == 'error'){
      throw new AccessDeniedHttpException;
    }

    $data = json_decode($request->getContent(), TRUE);
    // Update the request with the data.
    $request->request->replace( is_array( $data ) ? $data : [] );
    if (isset($data['contact'])) {
      try {
        // Find your Account SID and Auth Token at twilio.com/console
        // and set the environment variables. See http://twil.io/secure
        $account_sid = 'AC98612360ca3c6a64da32e80e751d81b0';
        $token = '8b2392a5c990e33328676cecde2ea44d';
        $service_id = 'VA110d6f8871c021e5ce915bd1eaa2c496';
        $type = 'sms';


        $twilio = new Client($account_sid, $token);
        // Format: "+18564269588"
        $verification = $twilio->verify->v2->services($service_id)
                                     ->verifications
                                     ->create( $data['contact'], $type);

        // If the status is not pending that means
        // somehting went wrong with the call.
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

    // Here we want to check the IP whitelist to make sure the
    // IP address is valid for access to this method.
    $api_error = TwilioApiHandler::validate_api_request($request);
    if (isset($api_error['status']) && $api_error['status'] == 'FAILURE'){
      throw new AccessDeniedHttpException;
    }

    $data = json_decode($request->getContent(), TRUE);
    // Update the request with the data.
    $request->request->replace( is_array( $data ) ? $data : [] );
    if (isset($data['contact']) && isset($data['code'])) {
      try {
        // @TODO add this to the settings file.
        // Find your Account SID and Auth Token at twilio.com/console
        // and set the environment variables. See http://twil.io/secure
        $account_sid = 'AC98612360ca3c6a64da32e80e751d81b0';
        $token = '8b2392a5c990e33328676cecde2ea44d';
        $service_id = 'VA110d6f8871c021e5ce915bd1eaa2c496';

        $twilio = new Client($account_sid, $token);
        // Format: "+18564269588"
        $verification_check = $twilio->verify->v2->services($service_id)
                                          ->verificationChecks
                                          ->create($data['code'],
                                                   ["to" => $data['contact']]
                                          );

        // If the status is not approved that means
        // somehting went wrong with the call.
        // $session = \Drupal::request()->getSession();
        // $session->set('twilio_sid', $verification_check->sid);


        // $tempstore = \Drupal::service('user.private_tempstore')->get('mymodule_name');
        // $tempstore->set('my_variable_name', $some_data);



        $status = $verification_check->status == 'approved' ? 200 : 400;
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

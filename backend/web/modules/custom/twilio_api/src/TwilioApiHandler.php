<?php
namespace Drupal\twilio_api;

/**
 * @file
 * Contains \Drupal\twilio_api\TwilioApiHandler.
 */

class TwilioApiHandler {

  const ALLOWED_IPS = [
    '172.19.0.2'
  ];

	static function validate_api_request($request) {
    $ip = $request->getClientIp();
    if (in_array($ip, TwilioApiHandler::ALLOWED_IPS)) {
      $api_error['status'] = 'SUCCESS';
    }
    else {
      $api_error['status'] = 'FAILURE';
    }
    return $api_error;
  }
}

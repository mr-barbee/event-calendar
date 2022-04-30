<?php
namespace Drupal\twilio_api;

/**
 * @file
 * Contains \Drupal\twilio_api\TwilioApiHandler.
 */

class TwilioApiHandler {

  /**
   * [allowedIPAdresses description]
   * @return [type] [description]
   */
  protected function allowedIPAdresses() {
    $config = \Drupal::config('twilio_api_settings_form.settings');
    return !empty($config->get('twilio_api_settings_form.allowed_ips')) ? explode(PHP_EOL, $config->get('twilio_api_settings_form.allowed_ips')): [];
  }

  /**
   * [validate_api_request description]
   * @param  [type] $request               [description]
   * @return [type]          [description]
   */
	static function validate_api_request($request) {
    $ip = $request->getClientIp();
    if (in_array($ip, TwilioApiHandler::allowedIPAdresses())) {
      $api_error['status'] = 'SUCCESS';
    }
    else {
      $api_error['status'] = 'FAILURE';
    }
    return $api_error;
  }
}

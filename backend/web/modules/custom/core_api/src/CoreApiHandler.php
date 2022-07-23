<?php
namespace Drupal\core_api;

use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * @file
 * Contains \Drupal\core_api\CoreApiHandler.
 */

class CoreApiHandler {

  /**
   * [allowedIPAdresses description]
   * @return [type] [description]
   */
  protected static function allowedIPAdresses() {
    $config = \Drupal::config('core_api_settings_form.settings');
    return !empty($config->get('core_api_settings_form.allowed_ips')) ? explode(PHP_EOL, $config->get('core_api_settings_form.allowed_ips')): [];
  }

  /**
   * [validate_api_request description]
   * @param  [type] $request               [description]
   * @return [type]          [description]
   */
  public static function validate_api_request($request) {
    $ip = $request->getClientIp();
    if (!in_array($ip, CoreApiHandler::allowedIPAdresses())) {
      throw new AccessDeniedHttpException;
    }
  }
}

<?php

namespace Drupal\core_api\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class CoreApiSettings extends ConfigFormBase {

  /**
   * Config settings.
   *
   * @var string
   */
  const SETTINGS = 'core_api_settings_form.settings';

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'core_api_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    // Form constructor.
    $form = parent::buildForm($form, $form_state);
    // Default settings.
    $config = $this->config(static::SETTINGS);

    $form['account_sid'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Account SID'),
      '#default_value' => $config->get('core_api_settings_form.account_sid'),
      '#description' => $this->t('This is the Twilio Account SID found in the Twilio API.'),
    ];

    $form['auth_token'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Auth Token'),
      '#default_value' => $config->get('core_api_settings_form.auth_token'),
      '#description' => $this->t('This is the Twilio Auth Token found in the Twilio API.'),
    ];

    $form['service_id'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Service ID'),
      '#default_value' => $config->get('core_api_settings_form.service_id'),
      '#description' => $this->t('This is the Twilio Service ID found in the Twilio API for the Service.'),
    ];

    $form['verify_email_template_id'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Verify Link Template ID'),
      '#default_value' => $config->get('core_api_settings_form.verify_email_template_id'),
      '#description' => $this->t('The template ID that contains the activation link.'),
    ];

    $form['allowed_ips'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Allowed IP\'s'),
      '#default_value' => $config->get('core_api_settings_form.allowed_ips'),
      '#description' => $this->t('Allowed API to access the twilio API. Seperate each IP on a new line.'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {

  }

  /**
    * {@inheritdoc}
    */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('core_api_settings_form.settings');
    $config->set('core_api_settings_form.account_sid', $form_state->getValue('account_sid'));
    $config->set('core_api_settings_form.auth_token', $form_state->getValue('auth_token'));
    $config->set('core_api_settings_form.service_id', $form_state->getValue('service_id'));
    $config->set('core_api_settings_form.verify_email_template_id', $form_state->getValue('verify_email_template_id'));
    $config->set('core_api_settings_form.allowed_ips', $form_state->getValue('allowed_ips'));
    $config->save();
    return parent::submitForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      static::SETTINGS,
    ];
  }

}

# Fully Decoupled Lando Environment
Running this Lando setup will install a Drupal 8 site behind an apache server, a MariaDB, and a Node server sharing a development version of Create React App at :3333. This is a fully decoupled website developed using React.js for the frontend and Drupal CMS for the backend. Drupal’s user and sessions are still utilized for user identity management.

## Running the environment
1. Clone this repo.
1. Run `lando start` to build the containers.
1. Open your browser to `https://cms.event-calendar.lndo.site/` and run a standard install.
1. Enable the GraphQL and other modules like Social Auth extra modules with `lando drush cim` to import all the configurations
1. Create some Events in the Drupal site with path aliases.
1. In a separate terminal window, run `lando npm start` to begin the React development server.
1. If Articles exist, you should see them at `https://event-calendar.lndo.site/` or a banner will appear with the error from the request.

## Developing on this environment

The environment is setup with all of your Drupal code in the backend folder and the React code in the frontend folder.

### Tools Available
Current Composer, Drush, Node, add npm are available and connected to their service.  

#### Composer
This Drupal build uses the Drupal Composer structure, so all new modules should be added with `lando composer require`.

#### Drush
Drush is available for the Drupal build. To run a command like clear cache, use `lando drush cr`. Any default Drush command should be available using `lando drush <command>`

#### Npm
The Create React app is installed and run using Npm. Any Npm command can be run using `npm <command>`. For example, if you have stopped the development server and want to restart it, just use `lando npm start`.

#### FullCalendar
The frontend utilizes the `https://fullcalendar.io` plugin for the calendar interface and that would come with an additional license cost for the full version. For the purposes of this site the free versions is sufficient.

#### GraphQL
GraphQL is used to serve up the Drupal data to the frontend interface. To enable GraphQL for the Drupal instance the [graphQL module](https://www.drupal.org/project/graphql) is used to serve up the Drupal content to the frontend. The GraphQL server for the backend is [here](https://cms.event-calendar.lndo.site/admin/config/graphql/servers/manage/event_calendar):

#### Twilio
Twilio API is used for user phone and email verification. An account would need to be made with Twilio and you API info will need to be saved [here](https://cms.event-calendar.lndo.site/admin/config/PATH-TO-TWILIO-CONFIG):

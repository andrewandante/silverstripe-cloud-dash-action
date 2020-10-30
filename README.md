# silverstripe-cloud-dash-action

This action interacts with the Silverstripe Cloud Dashboard API.

Currently creates a deployment for the commit SHA that triggered the
workflow.

## Inputs

### dash-api-username [Required]

(Usually) email address of the user you will be authenticating as.

### dash-api-token [Required]

API token generated from your profile that allows you to interact with 
the dashboard

### dash-stack-name [Required]

Short name for your stack (check the URL in Dash). Maximum 8 characters

### dash-env-name [Required]

Which environment to interact with (usually UAT or Production)

### bypass-level

One of:

- `none` - will just create the deployment
- `approval` - will create and bypass approval, but not start the deployment
- `start' - will bypass and start immediately

If you get a `403` response when setting one of these, you probably don't have permission to bypass - check with your stack manager.

### debug

Show debug output (default: false)

## Development

### Requirements

- `yarn`
- `ncc` installed globally

### Changes

Use the `develop` branch for changes. Make your edits in `index.js`, but make
sure you run `yarn build` before committing, as the file in `dist/index.js`
is what is actually read when the action is run.

Use semver for tagging and releases.

## TODOs

- split out a core library for Dash access and re-use it for a CWP version
- make things a little more customisable
    - fill in description somehow
    - allow different 'bypass' types
    - custom deploy titles
    - deploy a tag/branch instead of a SHA

# silverstripe-cloud-dash-action

This action interacts with the Silverstripe Cloud Dashboard API.

## Inputs

### dash-api-username [Required]

(Usually) email address of the user you will be authenticating as.

### dash-api-token [Required]

API token generated from your profile that allows you to interact with 
the dashboard

## Development

### Requirements

- `yarn`
- `ncc` installed globally

### Changes

Use the develop branch for changes. Make your edits in `index.js`, but make
sure you run `yarn build` before committing, as the file in `dist/index.js`
is what is actually read when the action is run.

Use semver for tagging and releases.

## TODOs

- split out a core library for Dash access and re-use it for a CWP version
- make things a little more customisable
    - fill in description somehow

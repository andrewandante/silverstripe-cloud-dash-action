import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from "fs";

try {
    const username = core.getInput('dash-api-username');
    const password = core.getInput('dash-api-token');
    const stack = core.getInput('dash-stack-name');
    const env = core.getInput('dash-env-name');
    const debug = !!core.getInput('debug');

    // Apparently this is the best way to get the event data
    const eventData = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));

    // @TODO make this configurable
    const baseURL = 'https://silverstripe.cloud/naut';
    const authConfig = {
        auth: {
            username,
            password,
        },
    };

    const axios = require('axios');

    (async () => {
        const pingResponse = await axios.get(
        `${baseURL}/meta`,
            authConfig
        );

        if (debug) {
            console.log(`[${pingResponse.status}]`);
            console.log(pingResponse.data);
        }

        const envShowResponse = await axios.get(
        `${baseURL}/project/${stack}/environment/${env}`,
            authConfig
        );

        if (debug) {
            console.log(`[${envShowResponse.status}]`);
            console.log(envShowResponse.data);
        }

        try {
            let triggerer = 'unknown';
            const eventType = github.context.eventName;
            if (eventType === 'push') {
                triggerer = eventData.pusher.email;
            } else if (eventType === 'pull_request') {
                triggerer = eventData.pull_request.user.login;
            }

            const createDeploymentResponse = await axios.post(
                `${baseURL}/project/${stack}/environment/${env}/deploys`,
                {
                    ref: github.context.ref,
                    ref_type: 'sha',
                    title: `[${triggerer}] triggered deployment via Github action`,
                },
                authConfig
            )
            .catch(error => {
                if (debug) {
                    console.log(error.response);
                }
                console.log(error.response.data.errors);
            });
            
            if (debug) {
                console.log(`[${createDeploymentResponse.status}]`);
                console.log(createDeploymentResponse.data);
            }
        } catch (error) {
            console.log('Create deployment failed!');
            console.log(error.message);
        }

    })();

} catch (error) {
    console.log('Uh oh. It didn\'t work!');
    core.setFailed(error.message);
}

import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from "fs";

try {
    const username = core.getInput('dash-api-username');
    const password = core.getInput('dash-api-token');
    const stack = core.getInput('dash-stack-name');
    const env = core.getInput('dash-env-name');
    let bypassLevel = core.getInput('bypass-level');
    if (!['none', 'approval', 'start'].includes(bypassLevel)) {
        console.log('Invalid bypass level detected - defaulting to [none]');
        bypassLevel = 'none';
    }

    const debug = !!core.getInput('debug');

    // Apparently this is the best way to get the event data
    const eventData = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));

    if (debug) {
        console.log(eventData);
    }

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

        const triggerSyncResponse = await axios.post(
            `${baseURL}/project/${stack}/git/fetches`,
            {},
            authConfig
        )
        .then(resp => {
            if (debug) {
                console.log(`[${triggerSyncResponse.status}]`);
                console.log(triggerSyncResponse.data);
            }
        })
        .catch(error => {
            console.log('Sync trigger failed - sleeping a bit then trying naively...');
        });

        if (triggerSyncResponse !== undefined && triggerSyncResponse.status === 202) {
            const syncID = triggerSyncResponse.data.id;
            let syncStatus = '';
            let syncStatusResponse = '';
            let attempts = 0;
            while (syncStatus !== 'Complete' && attempts < 10) {
                attempts++
                await new Promise(r => setTimeout(r, 2000));
                syncStatusResponse = await axios.get(
                    `${baseURL}/project/${stack}/git/fetches/${syncID}`,
                    authConfig
                );
                syncStatus = syncStatusResponse.data.attributes.status;
            }
            console.log('Sync complete!')
        } else {
            await new Promise(r => setTimeout(r, 10000));
        }

        try {
            let triggerer = 'unknown';
            let ref = github.context.ref;
            const eventType = github.context.eventName;
            if (eventType === 'push') {
                triggerer = eventData.pusher.name;
                ref = eventData.after;
            } else if (eventType === 'pull_request') {
                triggerer = eventData.pull_request.user.login;
                ref = eventData.pull_request.pull_request.head.sha;
            }

            let deployPayload = {
                ref ,
                ref_type: 'sha',
                title: `[${triggerer}] triggered deployment via Github action`,
                bypass: bypassLevel === 'approval',
                bypass_and_start: bypassLevel === 'start',
            };

            const createDeploymentResponse = await axios.post(
                `${baseURL}/project/${stack}/environment/${env}/deploys`,
                deployPayload,
                authConfig,
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

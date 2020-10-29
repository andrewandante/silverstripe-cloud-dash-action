import * as core from '@actions/core';
import * as github from '@actions/github';
import moment from "moment";

try {
    const username = core.getInput('dash-api-username');
    const password = core.getInput('dash-api-token');
    const repo = github.context.repo;
    const octokit = new github.GitHub(core.getInput('github-token'));
    const axios = require('axios');

    const response = await axios.get(
        'https://silverstripe.cloud/naut/meta',
        {
            auth: {
                username,
                password,
            },
        }
    );

    console.log(response.status);
    console.log(response.data);
} catch (error) {
    console.log('Uh oh. It didn\'t work!');
    core.setFailed(error.message);
}

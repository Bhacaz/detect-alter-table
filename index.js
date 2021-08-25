const core = require('@actions/core');
const github = require('@actions/github');

const token = core.getInput("gh-token", { required: true });
const client = github.getOctokit(token);

function getPrNumber() {
    const pullRequest = github.context.payload.pull_request;
    if (!pullRequest) {
        return undefined;
    }

    return pullRequest.number;
}

async function getChangedFiles(client, prNumber) {
    const listFilesOptions = client.rest.pulls.listFiles.endpoint.merge({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number: prNumber,
    });

    const listFilesResponse = await client.paginate(listFilesOptions);
    let changedFiles = listFilesResponse.map((f) => f.filename);
    changedFiles = changedFiles.filter(file => file.includes('db/migrate'))

    core.info("found changed files:");
    for (const file of changedFiles) {
        core.info("  " + file);
    }

    return changedFiles;
}

async function fetchContent(
    client,
    repoPath
) {
    const response = await client.rest.repos.getContent({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        path: repoPath,
        ref: github.context.sha,
    });

    return Buffer.from(response.data.content, response.data.encoding).toString();
}

async function detectAlterTable() {
    const filesPath = await getChangedFiles(client, getPrNumber())
    filesPath.find(file => {
        fetchContent(client, file).then(content => {
            if(content.includes('change_table')) {
                core.setFailed(`ALTER TABLE method found in ${file}`);
            }
        })
    })
}

detectAlterTable();

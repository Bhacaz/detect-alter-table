const core = require('@actions/core');
const github = require('@actions/github');

const token = core.getInput("gh-token", { required: true });
const errorMessage = core.getInput("error-message", { required: false });
const client = github.getOctokit(token);

// https://api.rubyonrails.org/v5.2.1/classes/ActiveRecord/ConnectionAdapters/SchemaStatements.html#method-i-rename_table_indexes
const alterTableMethods = [
    'add_column',
    'add_foreign_key',
    'add_index',
    'add_reference',
    'add_timestamps',
    'change_column',
    'change_column_default',
    'change_column_null',
    'change_table',
    'rename_column',
    'rename_index',
    'rename_table',
    'remove_column',
    'remove_columns',
    'rename_column_indexes',
    'remove_foreign_key',
    'remove_index',
    'remove_index',
    'remove_reference',
    'remove_timestamps',
    'rename_table_indexes'
]
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

    core.notice(`Migration files:\n` + changedFiles.join('\n'));

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
            alterTableMethods.forEach(method => {
                if(content.includes(method)) {
                    core.error(`Alter table method found in ${file}`);
                core.setFailed(`${errorMessage}: '${method}' in '${file}'`);
                }
            })
        })
    })
}

detectAlterTable();

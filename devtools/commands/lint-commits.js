const { Octokit } = require('@octokit/rest');
const execa = require('execa');

const git = async (...args) => {
    const { stdout } = await execa('git', args);

    return stdout;
};

const checkCommit = async (...refs) => Promise.all(refs.map(ref => git('cat-file', '-e', ref)));

const matchGithub = (url, prop) => {
    if (!url) {
        throw new Error();
    }

    const match = url.match(new RegExp(`github\\.com/(.+)/(.+)/${prop}/(.+)`));

    if (!match) {
        throw new Error();
    }

    const [, owner, repo, data] = match;

    return { owner, repo, data };
};

const getRangeFromPr = async () => {
    const ghToken = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

    if (!ghToken) {
        throw new Error('GitHub token is missing');
    }

    if (process.env.CIRCLE_PULL_REQUEST) {
        // use CircleCI setup
        const { owner, repo, data: pull } = matchGithub(process.env.CIRCLE_PULL_REQUEST, 'pull');
        const github = new Octokit({ auth: ghToken });

        console.info('📡   Looking up PR #%s...', pull);

        const {
            data: { base, head },
        } = await github.pulls.get({ owner, repo, pull_number: +pull });

        await checkCommit(base.sha, head.sha);
        console.info('🔀   Linting PR #%s', pull);

        return [base.sha, head.sha];
    }

    throw new Error('Environment not supported to get a range');
};

const getRangeFromCompare = async () => {
    if (process.env.CIRCLE_COMPARE_URL) {
        // use CircleCI setup
        const [from, to] = matchGithub(process.env.CIRCLE_COMPARE_URL, 'compare').data.split('...');

        await checkCommit(from, to);
        console.info('🎏   Linting using comparison URL %s...%s', from, to);

        return [from, to];
    }

    throw new Error('Environment not supported to identity the comparison');
};

const getRangeFromSha = async () => {
    // for CircleCI get the commit ID from `CIRCLE_SHA1`
    // for GH Actions get the commit ID from `GITHUB_SHA`
    const sha = process.env.CIRCLE_SHA1 || process.env.GITHUB_SHA;

    if (!sha) {
        throw new Error('Cannot find the git commit ID in environment variable');
    }

    await checkCommit(sha);
    console.info('⚙️   Linting using commit ID (%s)', sha);

    return [`${sha}^1`, sha];
};

const runLint = ([from, to]) => execa('yarn', ['commitlint', '--from', from, '--to', to, '-V'], { stdio: 'inherit' });

const run = () =>
    getRangeFromPr()
        .catch(getRangeFromCompare)
        .catch(getRangeFromSha)
        .then(runLint, error => {
            console.error(error);
            process.exit(1);
        })
        .catch(() => {
            process.exit(1);
        });

run();

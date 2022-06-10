import { Octokit } from '@octokit/rest';
import execa from 'execa';

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
    const { owner, repo, data: pull } = matchGithub(process.env.CIRCLE_PULL_REQUEST, 'pull');
    const github = new Octokit({ auth: process.env.GH_TOKEN });

    console.info('📡   Looking up PR #%s...', pull);

    const {
        data: { base, head },
    } = await github.pulls.get({ owner, repo, pull_number: +pull });

    await checkCommit(base.sha, head.sha);
    console.info('🔀   Linting PR #%s', pull);

    return [base.sha, head.sha];
};

const getRangeFromCompare = async () => {
    const [from, to] = matchGithub(process.env.CIRCLE_COMPARE_URL, 'compare').data.split('...');

    await checkCommit(from, to);
    console.info('🎏   Linting using comparison URL %s...%s', from, to);

    return [from, to];
};

const getRangeFromSha = async () => {
    const sha = process.env.CIRCLE_SHA1;

    if (!sha) {
        throw new Error('Cannot find CIRCLE_SHA1 environment variable');
    }

    await checkCommit(sha);
    console.info('⚙️   Linting using CIRCLE_SHA1 (%s)', sha);

    return [`${sha}^1`, sha];
};

const runLint = ([from, to]) => execa('yarn', ['commitlint', '--from', from, '--to', to, '-V'], { stdio: 'inherit' });

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

export {};

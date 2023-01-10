import { DockerComposeEnvironment, Wait } from 'testcontainers';
import { URL } from 'node:url';
import path from 'node:path';
import { execSync } from 'node:child_process';

const dirname = path.dirname(new URL(import.meta.url).pathname);
const root = path.join(dirname, '..');
const composeFilePath = path.join(dirname, '..', 'ddc-test-cluster');
const composeFile = 'docker-compose.local-npm.yml';
const app = await new DockerComposeEnvironment(composeFilePath, composeFile)
    .withWaitStrategy("app-ci-test", Wait.forHealthCheck())
    .up();

execSync('rm .npmrc', {
    stdio: 'inherit',
    cwd: root
});

const data = execSync(`curl -s -H "Accept: application/json" -H "Content-Type:application/json" -X PUT --data '{"name": "foo", "password": "bar"}' http://localhost:4873/-/user/org.couchdb.user:foo`);
const token = JSON.parse(data).token;
execSync(`npm set //localhost:4873/:_authToken ${token}`, {stdio: 'inherit'})

execSync('npm whoami', {
    stdio: 'inherit'
});

execSync('npm get registry', {
    stdio: 'inherit'
});

execSync('node scripts/publish.js', {
    cwd: root,
    stdio: 'inherit',
});

await app.down();

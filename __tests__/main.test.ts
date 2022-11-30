import fs from 'fs';
import execa from 'execa';
import { runTestsInScratchDirectory } from './helpers/scratch-directory';
import { initRepository, addAndTrackRemote } from './helpers/git';

runTestsInScratchDirectory();

let originalOutput = process.env.GITHUB_OUTPUT;

beforeEach(async () => {
  await initRepository(process.cwd());

  fs.writeFileSync('package.json', JSON.stringify({ version: '1.2.3' }));
  await execa('git', ['add', 'package.json']);
  await execa('git', ['commit', '-m', 'Add package.json']);

  delete process.env.GITHUB_OUTPUT;
});

afterEach(() => {
  process.env.GITHUB_OUTPUT = originalOutput;
});

describe('with a changed version', () => {
  beforeEach(async () => {
    await initRepository('upstream');
    await addAndTrackRemote('origin', 'upstream/.git');

    fs.writeFileSync('package.json', JSON.stringify({ version: '2.0.0' }));
    await execa('git', ['commit', '-am', 'Bump version']);
  });

  test('creates a new tag', async () => {
    let result = await execa.node(`${__dirname}/../lib/main.js`, {
      env: {
        GITHUB_REF: 'main',
      },
    });

    // Ensure tags exist here and upstream
    await execa('git', ['rev-parse', 'v2.0.0']);
    await execa('git', ['rev-parse', 'v2.0.0'], { cwd: 'upstream' });

    expect(result.stdout).toMatchInlineSnapshot(`
      "Previous version: 1.2.3

      ::set-output name=previous-version::1.2.3
      Current version: 2.0.0

      ::set-output name=current-version::2.0.0
      Creating tag v2.0.0

      ::set-output name=tag::v2.0.0"
    `);
  });

  test('skips tag creation when configured to', async () => {
    let result = await execa.node(`${__dirname}/../lib/main.js`, {
      env: {
        GITHUB_REF: 'main',
        'INPUT_CREATE-TAG': 'false',
      },
    });

    expect(result.stdout).toMatchInlineSnapshot(`
      "Previous version: 1.2.3

      ::set-output name=previous-version::1.2.3
      Current version: 2.0.0

      ::set-output name=current-version::2.0.0"
    `);
  });
});

describe('with no version change', () => {
  test('emits the same previous and current version', async () => {
    fs.writeFileSync('package.json', JSON.stringify({ version: '1.2.3', name: 'changed' }));
    await execa('git', ['commit', '-am', 'Change name']);

    let result = await execa.node(`${__dirname}/../lib/main.js`, {
      env: {
        GITHUB_REF: 'main',
      },
    });

    expect(result.stdout).toMatchInlineSnapshot(`
      "Previous version: 1.2.3

      ::set-output name=previous-version::1.2.3
      Current version: 1.2.3

      ::set-output name=current-version::1.2.3"
    `);
  });
});

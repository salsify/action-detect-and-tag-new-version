import * as git from '../src/git';
import execa from 'execa';
import { runTestsInScratchDirectory } from './helpers/scratch-directory';
import { initRepository, addAndTrackRemote } from './helpers/git';

runTestsInScratchDirectory();

beforeEach(async () => {
  await initRepository(process.cwd());
});

describe('validateHistoryDepth', () => {
  test('rejects with only one commit', async () => {
    expect.assertions(1);
    try {
      await git.validateHistoryDepth();
    } catch (error) {
      expect(error.message).toMatch('shallow clone');
    }
  });

  test('resolves with multiple commits', async () => {
    expect.assertions(0);
    await execa('git', ['commit', '--allow-empty', '-m', 'an empty commit']);
    await git.validateHistoryDepth();
  });
});

describe('refExists', () => {
  test('returns true for existing refs', async () => {
    await execa('git', ['tag', 'a-tag']);
    expect(await git.refExists('HEAD')).toBe(true);
    expect(await git.refExists('master')).toBe(true);
    expect(await git.refExists('a-tag')).toBe(true);
  });

  test('returns true for existing refs', async () => {
    expect(await git.refExists('HEAD~3')).toBe(false);
    expect(await git.refExists('nonexistent-branch')).toBe(false);
    expect(await git.refExists('a-tag')).toBe(false);
  });
});

describe('createTag', () => {
  test('creates and pushes the given tag', async () => {
    await initRepository('upstream');
    await addAndTrackRemote('foo', 'upstream/.git');

    await git.createTag('foo-bar', 'Here is my commit annotation.');

    let localTag = await execa('git', ['tag', '-n1']);
    expect(localTag.stdout.trim()).toMatch(/^foo-bar\s+Here is my commit annotation.$/);

    let remoteTag = await execa('git', ['tag', '-n1'], { cwd: 'upstream' });
    expect(remoteTag.stdout.trim()).toMatch(/^foo-bar\s+Here is my commit annotation.$/);
  });
});

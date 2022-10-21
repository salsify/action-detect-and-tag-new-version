import fs from 'fs';
import execa from 'execa';

export async function initRepository(dir: string): Promise<void> {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  await execa('git', ['init', '-b', 'main'], { cwd: dir });
  await execa('git', ['config', 'user.name', 'Test User'], { cwd: dir });
  await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
  await execa('git', ['commit', '--allow-empty', '-m', 'initial commit'], { cwd: dir });
}

export async function addAndTrackRemote(name: string, url: string): Promise<void> {
  await execa('git', ['remote', 'add', name, url]);
  await execa('git', ['fetch', '--all']);
  await execa('git', ['branch', '--set-upstream-to', `${name}/main`]);
}

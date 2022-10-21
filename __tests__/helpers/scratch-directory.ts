import path from 'path';
import os from 'os';
import fs from 'fs';

export function runTestsInScratchDirectory(): void {
  let cwd = process.cwd();
  let testDir = path.join(os.tmpdir(), Math.random().toString(36));

  beforeEach(async () => {
    fs.mkdirSync(testDir);
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(cwd);
    fs.rmSync(testDir, { recursive: true, force: true });
  });
}

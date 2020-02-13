import fs from 'fs';
import { runTestsInScratchDirectory } from './helpers/scratch-directory';

import { determineVersion } from '../src/determine-version';

runTestsInScratchDirectory();

test('detects a Ruby project', async () => {
  fs.writeFileSync(
    'my-project.gemspec',
    `Gem::Specification.new { |spec| spec.version = '1.2.3' }`,
  );

  expect(await determineVersion()).toBe('1.2.3');
});

test('detects a JavaScript project', async () => {
  fs.writeFileSync('package.json', '{"version":"2.3.4"}');

  expect(await determineVersion()).toBe('2.3.4');
});

test('uses a custom command when specified', async () => {
  fs.writeFileSync('my-project.gemspec', 'garbage');
  fs.writeFileSync('package.json', 'trash');

  process.env['INPUT_VERSION-COMMAND'] = 'echo 3.4.5';

  expect(await determineVersion()).toBe('3.4.5');
});

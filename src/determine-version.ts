import { existsSync } from 'fs';
import { sync as glob } from 'glob';
import { getInput } from '@actions/core';
import execa from 'execa';

export async function determineVersion(): Promise<string> {
  let command = determineVersionCommand();
  let result = await execa.command(command, { shell: true });
  return result.stdout.trim();
}

function determineVersionCommand(): string {
  let command = getInput('version-command');
  if (command) {
    return command;
  }

  if (existsSync('package.json')) {
    return `node -p 'require("./package.json").version'`;
  } else {
    let gemspecs = glob('*.gemspec');
    if (gemspecs.length === 1) {
      return `ruby -e "puts Gem::Specification.load('${gemspecs[0]}').version"`;
    }
  }

  throw new Error('No `version-command` specified, and unable to guess from repo contents.');
}

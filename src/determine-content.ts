import { getInput } from '@actions/core';
import execa from 'execa';

export async function determineContent(): Promise<string> {
  let command = determineCommand();
  let result = await execa.command(command, { shell: true });
  return result.stdout.trim();
}

function determineCommand(): string {
  let command = getInput('diff-on-content');
  if (command) {
    return command;
  }

  throw new Error('No `diff-on-content` specified, and unable to guess from repo contents.');
}

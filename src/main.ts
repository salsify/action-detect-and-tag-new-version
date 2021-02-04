import { getInput, setFailed, setOutput, info } from '@actions/core';
import { determineContent } from './determine-content';
import { validateHistoryDepth, checkout, createTag, refExists } from './git';
import { getEnv } from './utils';

const VERSION_PLACEHOLDER = /{VERSION}/g;
const DATETIME_EPOCH_PLACEHOLDER = /{DATETIME_EPOCH}/g;

async function run(): Promise<void> {
  await validateHistoryDepth();
  await checkout('HEAD~1');

  let previousContent = await determineContent();

  info(`Previous Content: ${previousContent}`);
  setOutput('previous-content', previousContent);

  await checkout(getEnv('GITHUB_REF'));

  let currentContent = await determineContent();

  info(`Current Content: ${currentContent}`);
  setOutput('current-content', currentContent);

  if (currentContent !== previousContent && getInput('create-tag') !== 'false') {
    let tagTemplate = getInput('tag-template');
    let tag = tagTemplate.replace(DATETIME_EPOCH_PLACEHOLDER, Date.now());

    let annotationTemplate = getInput('tag-annotation-template') || 'Released version {VERSION}';
    let annotation = annotationTemplate.replace(DATETIME_EPOCH_PLACEHOLDER, Date.now());

    if (await refExists(tag)) {
      info(`Tag ${tag} already exists`);
    } else {
      info(`Creating tag ${tag}`);
      setOutput('tag', tag);

      await createTag(tag, annotation);
    }
  }
}

run().catch(e => setFailed(e.message));

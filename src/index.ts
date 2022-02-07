import { setFailed } from '@actions/core';
import { run } from './run';

run().catch(error => {
  setFailed(error);
});

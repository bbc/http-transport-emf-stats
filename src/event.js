import { camelCase } from './util';

export function addCacheEventListener(attempt, action, cacheAudit) {
  // even if the same event is emitted multiple times
  // the action will be counted as one
  // eslint-disable-next-line no-param-reassign
  attempt.cache[camelCase(action)] = true;
  // this one is for troubleshooting purposes
  cacheAudit.push(action);
}

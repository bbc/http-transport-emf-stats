export function initStats(upstreamName) {
  return {
    attempts: [],
    attemptCount: 0, // The number of request attempts in total. This number is equal to "attempts.length".
    retryCount: 0, // The number of retried attempts. This number is equal to "attemptCount - 1".
    requestCount: 0, // The number of times a request is sent to and a response is received from the upstream
    requestErrorCount: 0, // The number of times the upstream service doesn't respond
    response5xxCount: 0, // The number of 5xx responses
    response4xxCount: 0, // The number of 4xx responses
    response3xxCount: 0, // The number of 3XX responses
    response2xxCount: 0, // The number of 2XX responses
    response1xxCount: 0, // The number of 1XX responses
    responseInvalidCount: 0, // The number of invalid response statuses
    cacheAudit: [], // Contains a list of groups of triggered events from the cache. It is used for troubleshooting purposes
    name: upstreamName
  };
}

export function initAttempt(emitter) {
  const response = null;
  let cache = null;

  if (emitter) {
    cache = {
      hit: false,
      miss: false,
      stale: false,
      error: false,
      timeout: false,
      revalidate: false,
      revalidateError: false
    };
  }

  return { cache, response };
}

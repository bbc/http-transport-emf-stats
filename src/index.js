import { camelCase } from './util';

/**
 * This object is referenced and updated by the plugin on each call.
 *
 * The lifetime of this object spans through the multiple plugin calls,
 * that's why this object is defined in the global scope.
 */
const statsObj = {
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
  cacheHitCount: 0, // The number of cache hits
  cacheMissCount: 0, // The number of cache misses
  cacheStaleCount: 0, // The number of cache stale
  cacheErrorCount: 0, // The number of cache error
  cacheTimeoutCount: 0, // The number of cache timeout
  cacheRevalidateCount: 0, // The number of cache revalidate
  cacheRevalidateErrorCount: 0, // The number of cache error revalidate
  cacheAudit: [] // List of cache events used for troubleshooting purposes
};

const HTTP_5XX_RESPONSE = 'HTTP_5XX_RESPONSE';

const actions = ['hit', 'miss', 'stale', 'error', 'timeout', 'revalidate', 'revalidate.error'];

async function statsPlugin(emitter, clientName, context, next) {
  const attempt = {
    cache: {
      hit: false,
      miss: false,
      stale: false,
      error: false,
      timeout: false,
      revalidate: false,
      revalidateError: false
    },
    response: null
  };

  const cacheAudit = [];
  let withResponse = true;

  try {
    /**
     * Adds event listeners for the cache events.
     *
     * These listeners must be defined before calling next. Everything
     * before is called in the order plugins are "used", everything after
     * is called backwards.
     *
     * Example, if I have the following plugins defined
     *
     * .use(p1).use(p2).use(p3)
     *
     * The execution will happen as following:
     *
     * Everything before "next" will be executed in this order: p1, p2, p3
     * Everything after "next" will be executed in this order: p3, p2, p1
     */
    if (emitter) {
      actions.forEach((action) => {
        emitter.on(`cache.${clientName}.${action}`, () => {
          attempt.cache[camelCase(action)] = true;
          cacheAudit.push(action);
        });
      });
    }

    /**
     * This reference must be set before calling next, otherwise
     * in case of an unresponsive upstream (e.g. ESOCKETTIMEDOUT)
     * "next" will throw an error, preventing the stats object
     * to be set in "context.res".
     */
    context.res.stats = statsObj;

    await next();

    /**
     * After this point, a valid response has been received.
     */

    context.res.stats.requestCount += 1;

    // 1xx response
    if (context.res.statusCode >= 100 && context.res.statusCode < 200) {
      context.res.stats.response1xxCount += 1;
      return;
    }

    // 2xx response
    if (context.res.statusCode < 300) {
      context.res.stats.response2xxCount += 1;
      return;
    }

    // 3xx response
    if (context.res.statusCode < 400) {
      context.res.stats.response3xxCount += 1;
      return;
    }

    // 4xx response
    if (context.res.statusCode < 500) {
      context.res.stats.response4xxCount += 1;
      return;
    }

    // 5xx response
    if (context.res.statusCode < 600) {
      context.res.stats.response5xxCount += 1;
      throw new Error(HTTP_5XX_RESPONSE);
    }

    context.res.stats.responseInvalidCount += 1;
  } catch (error) {
    if (error.message !== HTTP_5XX_RESPONSE) {
      withResponse = false;
      context.res.stats.requestErrorCount += 1;
    }

    error.stats = context.res.stats;
    throw error;
  } finally {
    if (withResponse) {
      attempt.response = {
        body: context.res.body,
        headers: context.res.headers,
        status: context.res.statusCode,
        time: context.res.elapsedTime
      };
    }

    context.res.stats.attempts.push(attempt);
    context.res.stats.cacheAudit.push(cacheAudit);
    context.res.stats.attemptCount += 1;
    if (context.res.stats.attemptCount > 0) {
      context.res.stats.retryCount = context.res.stats.attemptCount - 1;
    }
  }
}

export default function stats(emitter, clientName) {
  return statsPlugin.bind(this, emitter, clientName);
}

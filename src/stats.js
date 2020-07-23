import * as init from './init';
import { addCacheEventListener } from './event';
import { HTTP_5XX_RESPONSE, actions } from './consts';

export default async function stats(emitter, upstreamName, context, next) {
  // flags the presence of an upstream response
  let withResponse = true;
  // init the current attempt
  const attempt = init.initAttempt(emitter);
  // init the cache audit array
  const cacheAudit = [];

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
        emitter.on(`cache.${upstreamName}.${action}`, addCacheEventListener.bind(this, attempt, action, cacheAudit));
      });
    }

    /**
     * It must be set before calling "next", otherwise
     * in case of an unresponsive upstream (e.g. ESOCKETTIMEDOUT)
     * "next" will throw an error jumping to the cacth block,
     * preventing the stats object to be set in "context.res".
     */
    if (typeof context.res.stats === 'undefined') {
      context.res.stats = init.initStats();
    }

    await next();

    /**
     * This same object must be set here after calling "next" as a workaround
     * of how the http-transport-cache plugin works.
     *
     * Initially, "context.res" is a "Response" object with properties and functions.
     * If cache is activated and the response is cached, it is serialised as a JSON object
     * with the following shape:
     *
     * {
     *   body: '{"service":"rms-the-doors","version":"258-1.x86_64","environment":"live"}',
     *   headers: {
     *     ...
     *   },
     *   statusCode: 200,
     *   elapsedTime: 15,
     *   url: '',
     *   fromCache: true,
     *   ttl: 54458,
     *   revalidate: undefined
     * }
     *
     * This means that after calling "next", if the response is being retrieved from the cache,
     * "context.res" is overwritten.
     */
    if (typeof context.res.stats === 'undefined') {
      context.res.stats = init.initStats();
      // jump to the "finally" block
      return;
    }

    /**
     * From this point onward, a valid uncached response has been received.
     */

    context.res.stats.requestCount += 1;

    // invalid HTTP response
    if (context.res.statusCode < 100) {
      context.res.stats.responseInvalidCount += 1;
      return;
    }

    // 1xx response
    if (context.res.statusCode < 200) {
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

    // 5xx response (it throws to eventually retry)
    if (context.res.statusCode < 600) {
      context.res.stats.response5xxCount += 1;
      throw new Error(HTTP_5XX_RESPONSE);
    }

    // everything else is an invalid HTTP response too
    context.res.stats.responseInvalidCount += 1;
  } catch (error) {
    // an error has been thrown because the upstream was unresponsive (e.g. ESOCKETTIMEDOUT)
    if (error.message !== HTTP_5XX_RESPONSE) {
      // signal there was no response
      withResponse = false;
      // increment the error count
      context.res.stats.requestErrorCount += 1;
    }
    error.stats = context.res.stats;
    // tells http-transport to retry
    throw error;
  } finally {
    context.res.stats.attemptCount += 1;
    attempt.id = context.res.stats.attemptCount;

    if (withResponse) {
      attempt.response = {
        body: context.res.body,
        headers: context.res.headers,
        status: context.res.statusCode,
        time: context.res.elapsedTime
      };
    }

    context.res.stats.attempts.push(attempt);

    if (cacheAudit.length > 0) {
      context.res.stats.cacheAudit.push(cacheAudit);
    }

    if (context.res.stats.attemptCount > 0) {
      context.res.stats.retryCount = context.res.stats.attemptCount - 1;
    }
  }
}

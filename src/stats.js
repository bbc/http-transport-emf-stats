import * as init from './init';
import { camelCase } from './util';

export const HTTP_5XX_RESPONSE = 'HTTP_5XX_RESPONSE';

export default async function stats(context, next) {
  try {
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

    context.res.stats.metrics.requestCount += 1;

    // invalid HTTP response
    if (context.res.statusCode < 100) {
      context.res.stats.metrics.responseInvalidCount += 1;
      return;
    }

    // 1xx response
    if (context.res.statusCode < 200) {
      context.res.stats.metrics.response1xxCount += 1;
      return;
    }

    // 2xx response
    if (context.res.statusCode < 300) {
      context.res.stats.metrics.response2xxCount += 1;
      return;
    }

    // 3xx response
    if (context.res.statusCode < 400) {
      context.res.stats.metrics.response3xxCount += 1;
      return;
    }

    // 4xx response
    if (context.res.statusCode < 500) {
      context.res.stats.metrics.response4xxCount += 1;
      return;
    }

    // 5xx response (it throws to eventually retry)
    if (context.res.statusCode < 600) {
      context.res.stats.metrics.response5xxCount += 1;
      throw new Error(HTTP_5XX_RESPONSE);
    }

    // everything else is an invalid HTTP response too
    context.res.stats.metrics.responseInvalidCount += 1;
  } catch (error) {
    // an error has been thrown because the upstream was unresponsive (e.g. ESOCKETTIMEDOUT)
    if (error.message !== HTTP_5XX_RESPONSE) {
      // increment the error count
      context.res.stats.metrics.requestErrorCount += 1;
    }
    error.body = context.res.body;
    error.headers = context.res.headers;
    error.statusCode = context.res.statusCode;
    error.stats = context.res.stats;

    // tells http-transport to retry
    throw error;
  } finally {
    context.res.stats.metrics.attemptCount += 1;
    context.res.stats.metrics.responseTime += Number.isInteger(context.res.elapsedTime) ? context.res.elapsedTime : 0;

    if (Array.isArray(context.cacheStatus)) {
      // adds the cache events to the "audit" array for troubleshooting purposes
      context.res.stats.cacheAudit.push(...context.cacheStatus);

      // Removes the elements from the "cacheStatus" array so to count them only once.
      // The cache events are appended to the "cacheStatus" array, given the events are summed up
      // by increasing a stateful counter in an iteration each time this plugin is invoked, if not removed
      // the same events would be counted multiple times.
      let cacheEvent = context.cacheStatus.shift();

      // iterates while the array is not empty
      while (cacheEvent) {
        // filter "read_time" and "write_time" out
        if (cacheEvent !== 'read_time' && cacheEvent !== 'write_time') {
          // increments the related cache counter
          // (e.g. if the event is "connection_error" the counter to be incremented is "cacheConnectionErrorCount")
          context.res.stats.metrics[`cache${camelCase(cacheEvent, true)}Count`] += 1;
        }
        // gets the next element
        // this allows the loop to exit
        cacheEvent = context.cacheStatus.shift();
      }
    }

    if (context.res.stats.metrics.attemptCount > 0) {
      context.res.stats.metrics.retryCount = context.res.stats.metrics.attemptCount - 1;
    }
  }
}

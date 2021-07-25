[![BBC](https://circleci.com/gh/bbc/http-transport-emf-stats.svg?style=shield)](https://app.circleci.com/pipelines/github/bbc/http-transport-emf-stats?branch=master)

* [Installation](#installation)
* [Usage](#usage)
* [Stats](#stats)
* [Testing and linting](#testing-and-linting)

# HTTP transport EMF stats

EMF stats is a plugin that can be used by [http-transport](https://github.com/bbc/http-transport) to return a stats object alongside the HTTP response.

## Installation

```bash
npm install @bbc/http-transport-emf-stats
```

or

```bash
yarn add @bbc/http-transport-emf-stats
```

## Usage

```js
import HttpTransport from '@bbc/http-transport';

const client = HttpTransport
  .createBuilder()
  .userAgent('...')
  .retries(...)
  .retryDelay(...)
  .use(stats())
  .createClient();
```

**With the cache enabled**

Used in conjunction with [@bbc/http-transport-cache](https://github.com/bbc/http-transport-cache)

```js
import HttpTransport from '@bbc/http-transport';
import { maxAge, staleIfError } from '@bbc/http-transport-cache';

const catbox = ...; // a catbox instance

const cacheOpts = {
  name: 'rms',
  ...
  ...
}

const client = HttpTransport
  .createBuilder()
  .userAgent('...')
  .retries(...)
  .retryDelay(...)
  .use(stats())
  .use(maxAge(catbox, cacheOpts))
  .use(staleIfError(catbox, cacheOpts))
  .createClient();
```

## Stats

The stats object is structured as following:

```js
{
  metrics: {
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
    responseTime: 0,
    cacheHitCount: 0,
    cacheMissCount: 0,
    cacheStaleCount: 0,
    cacheErrorCount: 0,
    cacheTimeoutCount: 0,
    cacheConnectionErrorCount: 0
  },
  cacheAudit: [] // A list of cache events triggered by the cache plugin if enabled. It is used for troubleshooting purposes only.
}
```

The `stats` object is set within `res` when the request resolves or in the error object when it rejects. If you want to access the stats info do as following:

```js
try {
  const response = await client.get(uri).asResponse();
  const { stats } = response.res;

  // can access stats data
} catch (error) {
  const { stats } = error;

  // can access stats data
}
```
## Testing and linting

To run unit tests and coverage reports

```
npm run test
```

or just tests without coverage report

```
npm run test:only
```

To run code linting

```
npm run lint
```

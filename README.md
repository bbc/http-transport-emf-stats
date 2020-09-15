[![BBC](https://circleci.com/gh/bbc/http-transport-emf-stats.svg?style=shield)](https://app.circleci.com/pipelines/github/bbc/http-transport-emf-stats?branch=master)

* [Installation](#installation)
* [Usage](#usage)
* [Stats](#stats)
* [Plugin options](#plugin-options)
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

**Without the cache enabled**

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

or

```js
import HttpTransport from '@bbc/http-transport';

const client = HttpTransport
  .createBuilder()
  .userAgent('...')
  .retries(...)
  .retryDelay(...)
  .use(stats({
    isCacheEnabled: false
  }))
  .createClient();
```

where `isCacheEnabled` is set to `false` by default.

**With the cache enabled**

Used in conjunction with [@bbc/http-transport-cache](https://github.com/bbc/http-transport-cache)

```js
import HttpTransport from '@bbc/http-transport';
import { events, maxAge, staleIfError } from '@bbc/http-transport-cache';

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
  .use(stats({
    isCacheEnabled: true
  }))
  .use(maxAge(catbox, cacheOpts))
  .use(staleIfError(catbox, cacheOpts))
  .createClient();
```

## Stats

The stats object is structured as following:

```js
{
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
  cacheAudit: [] // Contains a list of groups of triggered events from the cache. It is used for troubleshooting purposes
}
```

The `attempt` object is structured as following if no cache is enabled and no response is received:

```js
{
  cache: null,
  response: null
}
```

or as following if the cache is enabled and a response is received:

```js
{
  cache: {
    hit: boolean,
    miss: boolean,
    stale: boolean,
    error: boolean,
    timeout: boolean,
    readTime: boolean,
    writeTime: boolean,
    connectionError: boolean
  },
  response: {
    time: number,
    status: number
  }
}
```

The `stats` object is set in the `res` object when the request resolves or in the error object when it rejects. If you want to access the stats info do as following:

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

## Plugin options

The stats plugin accepts the following object as input parameter:

```js
{
  isCacheEnabled: true
}
```

where `isCacheEnabled` allows to initialise the `cache` object of the `attempt`.

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

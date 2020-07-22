# HTTP transport EMF stats
[![Build Status](https://travis-ci.org/bbc/http-transport-emf-stats.svg?branch=master)](https://travis-ci.org/bbc/http-transport-emf-stats)

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

An example usage of this plugin is:

```js
import HttpTransport from '@bbc/http-transport';
```

without cache enabled

```js
const client = HttpTransport
  .createBuilder()
  .userAgent('...')
  .retries(...)
  .retryDelay(...)
  .use(stats())
  .createClient();
```

or with cache enabled in conjunction with [http-transport-cache](https://github.com/bbc/http-transport-cache)

```js
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
  .use(stats(events, cacheOpts.name))
  .use(maxAge(catbox, cacheOpts))
  .use(staleIfError(catbox, cacheOpts))
  .createClient();
```

## Stats

The stats object is structured as following:

```js
{
  attempts: [], // a list of objects representing each single attempt
  attemptCount: 0, // The number of attempts in total. This number is equal to "attempts.length".
  retryCount: 0, // The number of retried attempts. This number is equal to "attemptCount - 1".
  requestCount: 0, // The number of times a request is sent to and a response is received from the upstream
  requestErrorCount: 0, // The number of times the upstream service doesn't respond
  response5xxCount: 0, // The number of 5xx responses
  response4xxCount: 0, // The number of 4xx responses
  response3xxCount: 0, // The number of 3XX responses
  response2xxCount: 0, // The number of 2XX responses
  response1xxCount: 0, // The number of 1XX responses
  responseInvalidCount: 0, // The number of invalid response statuses
  cacheAudit: [] // A list of emitted cache events. It is populated by for troubleshooting/logging purposes
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
    revalidate: boolean,
    revalidateError: boolean
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

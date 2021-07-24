import sinon from 'sinon';
import { expect } from 'chai';
import * as init from '../src/init';
import stats from '../src/stats';
import { camelCase } from '../src/util';

describe('[src/stats.js]', () => {
  let context;
  let next;

  beforeEach(() => {
    sinon.stub(init, 'initStats').returns({
      metrics: {
        attemptCount: 0,
        retryCount: 0,
        requestCount: 0,
        requestErrorCount: 0,
        response5xxCount: 0,
        response4xxCount: 0,
        response3xxCount: 0,
        response2xxCount: 0,
        response1xxCount: 0,
        responseInvalidCount: 0,
        responseTime: 0,
        cacheHitCount: 0,
        cacheMissCount: 0,
        cacheStaleCount: 0,
        cacheErrorCount: 0,
        cacheTimeoutCount: 0,
        cacheConnectionErrorCount: 0
      },
      cacheAudit: []
    });
    context = {
      cacheStatus: [],
      res: {
        body: 'response body',
        headers: 'response headers',
        statusCode: 0
      }
    };
    next = sinon.stub();
  });

  afterEach(() => sinon.restore());

  it('should initialise the stats object and call next', async () => {
    await stats(context, next);

    sinon.assert.calledOnce(init.initStats);
    sinon.assert.calledOnce(next);
  });

  it('should throw an error with stats if "next" throws', async () => {
    const errorMessage = 'ESOCKETTIMEDOUT';
    next.throws(new Error(errorMessage));

    try {
      await stats(context, next);
    } catch (error) {
      sinon.assert.calledOnce(init.initStats);
      sinon.assert.calledOnce(next);
      expect(error.message).to.be.equal(errorMessage);
      expect(error.body).to.be.equal(context.res.body);
      expect(error.headers).to.be.equal(context.res.headers);
      expect(error.statusCode).to.be.equal(context.res.statusCode);
      expect(error.stats).to.be.deep.equal({
        metrics: {
          attemptCount: 1,
          retryCount: 0,
          requestCount: 0,
          requestErrorCount: 1,
          response5xxCount: 0,
          response4xxCount: 0,
          response3xxCount: 0,
          response2xxCount: 0,
          response1xxCount: 0,
          responseInvalidCount: 0,
          responseTime: 0,
          cacheHitCount: 0,
          cacheMissCount: 0,
          cacheStaleCount: 0,
          cacheErrorCount: 0,
          cacheTimeoutCount: 0,
          cacheConnectionErrorCount: 0
        },
        cacheAudit: []
      });
    }
  });

  describe('when the response is cached', () => {
    let nextSpy;

    beforeEach(() => {
      nextSpy = sinon.spy();
      next = () => {
        // retrieves the serialised response from the cache without the stats object
        context.res = {
          cacheStatus: [],
          res: {
            body: 'response body',
            headers: 'response headers',
            statusCode: 0
          }
        };
        // calls the spy for "next";
        nextSpy();
      };
    });

    it('should call "initStats" twice to prevent the reset of the stats object', async () => {
      await stats(context, next);

      sinon.assert.calledTwice(init.initStats);
      sinon.assert.calledOnce(nextSpy);
    });

    it('should increment the number of attempts but not the "requestCount"', async () => {
      await stats(context, next);

      expect(context.res.stats.metrics.attemptCount).to.be.equal(1);
      expect(context.res.stats.metrics.requestCount).to.be.equal(0);
    });
  });

  describe('the responseXxx counters', () => {
    const tests = [
      {
        statusCode: 100,
        expected: 'response1xxCount'
      },
      {
        statusCode: 200,
        expected: 'response2xxCount'
      },
      {
        statusCode: 300,
        expected: 'response3xxCount'
      },
      {
        statusCode: 400,
        expected: 'response4xxCount'
      },
      {
        statusCode: 500,
        expected: 'response5xxCount'
      },
      {
        statusCode: 90,
        expected: 'responseInvalidCount'
      },
      {
        statusCode: 600,
        expected: 'responseInvalidCount'
      }
    ];

    tests.forEach((test) => {
      const { statusCode, expected } = test;

      it(`should increment ${expected} when the status code is ${statusCode}`, async () => {
        context.res.statusCode = statusCode;

        if (statusCode === 500) {
          try {
            await stats(context, next);
          } catch (e) {
            expect(context.res.stats.metrics[expected]).to.be.equal(1);
            expect(context.res.stats.metrics.requestCount).to.be.equal(1);
            expect(context.res.stats.metrics.requestErrorCount).to.be.equal(0);
          }
          return;
        }

        await stats(context, next);
        expect(context.res.stats.metrics[expected]).to.be.equal(1);
        expect(context.res.stats.metrics.requestCount).to.be.equal(1);
      });
    });
  });

  describe('attempts and retries', () => {
    const tests = [
      {
        attempts: 1,
        retries: 0
      },
      {
        attempts: 2,
        retries: 1
      },
      {
        attempts: 3,
        retries: 2
      }
    ];

    tests.forEach((test) => {
      const { attempts, retries } = test;

      it(`should have ${attempts} attempts and ${retries} retries if the stats is called ${attempts} times`, async () => {
        const promises = [];
        for (let i = 0; i < attempts; i += 1) {
          promises.push(stats(context, next));
        }

        await Promise.all(promises);

        expect(context.res.stats.metrics.attemptCount).to.be.equal(attempts);
        expect(context.res.stats.metrics.retryCount).to.be.equal(retries);
      });
    });
  });

  describe('the response time', () => {
    const tests = [
      {
        elaspedTime: undefined,
        responseTime: 0
      },
      {
        elaspedTime: null,
        responseTime: 0
      },
      {
        elaspedTime: 'a string',
        responseTime: 0
      },
      {
        elaspedTime: true,
        responseTime: 0
      },
      {
        elaspedTime: 128,
        responseTime: 128
      }
    ];

    tests.forEach((test) => {
      const { elaspedTime, responseTime } = test;

      it(`should have the response time equal to ${responseTime} if elapsed time is ${elaspedTime}`, async () => {
        context.res.elapsedTime = elaspedTime;
        await stats(context, next);
        expect(context.res.stats.metrics.responseTime).to.be.equal(responseTime);
      });
    });
  });

  describe('the cache counters and the cache audit array', () => {
    const tests = [
      {
        cacheStatusLabel: 'is null',
        cacheStatus: null,
        cacheAuditLabel: 'an empty array',
        cacheAudit: []
      },
      {
        cacheStatusLabel: 'is undefined',
        cacheStatus: undefined,
        cacheAuditLabel: 'an empty array',
        cacheAudit: []
      },
      {
        cacheStatusLabel: 'is a boolean',
        cacheStatus: false,
        cacheAuditLabel: 'an empty array',
        cacheAudit: []
      },
      {
        cacheStatusLabel: 'is an empty array',
        cacheStatus: [],
        cacheAuditLabel: 'an empty array',
        cacheAudit: []
      },
      {
        cacheStatusLabel: 'has an unrecognised element',
        cacheStatus: ['not_recognised'],
        cacheAuditLabel: 'an empty array',
        cacheAudit: []
      },
      {
        cacheStatusLabel: 'is equal to ["hit", "miss", "stale"]',
        cacheStatus: ['hit', 'miss', 'stale'],
        cacheAuditLabel: '["hit", "miss", "stale"]',
        cacheAudit: ['hit', 'miss', 'stale']
      },
      {
        cacheStatusLabel: 'is equal to ["error", "timeout", "connection_error"]',
        cacheStatus: ['error', 'timeout', 'connection_error'],
        cacheAuditLabel: '["error", "timeout", "connection_error"]',
        cacheAudit: ['error', 'timeout', 'connection_error']
      }
    ];

    tests.forEach((test) => {
      const {
        cacheStatus,
        cacheAudit,
        cacheStatusLabel,
        cacheAuditLabel
      } = test;

      it(`should have cacheAudit equal to ${cacheAuditLabel} if cacheStatus ${cacheStatusLabel}`, async () => {
        context.cacheStatus = cacheStatus;
        await stats(context, next);
        expect(cacheAudit).to.be.equal(cacheAudit);
        cacheAudit.forEach((cacheEvent) => {
          expect(context.res.stats.metrics[`cache${camelCase(cacheEvent, true)}Count`]).to.be.equal(1);
        });
      });
    });
  });
});

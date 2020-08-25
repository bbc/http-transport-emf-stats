import sinon from 'sinon';
import { expect } from 'chai';
import * as init from '../src/init';
import stats from '../src/stats';

describe('[src/stats.js]', () => {
  let emitter;
  let clientName;
  let context;
  let next;

  beforeEach(() => {
    emitter = {
      on: sinon.spy(),
      listeners: sinon.spy()
    };
    clientName = 'test';
    context = {
      res: {}
    };
    next = sinon.spy();
  });

  afterEach(() => sinon.restore());

  describe('attempt object initialisation', () => {
    it('should call "initAttempt" with undefined if the emitter is not defined', async () => {
      sinon.stub(init, 'initAttempt').returns({});
      emitter = undefined;

      await stats(emitter, clientName)(context, next);

      sinon.assert.calledOnceWithExactly(init.initAttempt, undefined);
    });

    it('should call "initAttempt" with the emitter if set', async () => {
      sinon.stub(init, 'initAttempt').returns({});

      await stats(emitter, clientName)(context, next);

      sinon.assert.calledOnceWithExactly(init.initAttempt, emitter);
    });
  });

  it('should call next only once', async () => {
    await stats(emitter, clientName)(context, next);
    sinon.assert.calledOnceWithExactly(next);
  });

  describe('stats initialisation', () => {
    it('should initialise stats if undefined', async () => {
      const statsResponse = { attempts: [], cacheAudit: [] };
      sinon.stub(init, 'initStats').returns(statsResponse);

      await stats(emitter, clientName)(context, next);

      sinon.assert.calledOnce(init.initStats);
      expect(context.res).to.be.deep.equal({ stats: statsResponse });
    });

    it('should call initStats twice if next overrides the response with content from the cache', async () => {
      const nextSpy = sinon.spy();
      next = async () => {
        context.res = {};
        nextSpy();
      };
      const statsResponse = { attempts: [], cacheAudit: [] };
      sinon.stub(init, 'initStats').returns(statsResponse);

      await stats(emitter, clientName)(context, next);

      sinon.assert.calledTwice(init.initStats);
    });

    it('should initialise the stats if next rejects', async () => {
      next = sinon.stub().rejects();
      try {
        await stats(emitter, clientName)(context, next);
      } catch {
        expect(context.res).to.haveOwnProperty('stats');
      }
    });
  });

  it('should increase attempt and request counters', async () => {
    await stats(emitter, clientName)(context, next);
    expect(context.res.stats.attemptCount).to.be.equal(1);
    expect(context.res.stats.requestCount).to.be.equal(1);
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
            await stats(emitter, clientName)(context, next);
          } catch (e) {
            expect(context.res.statusCode).to.be.equal(statusCode);
            expect(context.res.stats[expected]).to.be.equal(1);
          }
          return;
        }

        await stats(emitter, clientName)(context, next);
        expect(context.res.statusCode).to.be.equal(statusCode);
        expect(context.res.stats[expected]).to.be.equal(1);
      });
    });
  });

  it('should not increase the requests and response counters if the response is cached', async () => {
    const nextSpy = sinon.spy();
    next = async () => {
      context.res = {};
      nextSpy();
    };
    await stats(emitter, clientName)(context, next);
    expect(context.res.stats).to.haveOwnProperty('attemptCount', 1);
    expect(context.res.stats).to.haveOwnProperty('retryCount', 0);
    expect(context.res.stats).to.haveOwnProperty('requestCount', 0);
    expect(context.res.stats).to.haveOwnProperty('requestErrorCount', 0);
    expect(context.res.stats).to.haveOwnProperty('response5xxCount', 0);
    expect(context.res.stats).to.haveOwnProperty('response4xxCount', 0);
    expect(context.res.stats).to.haveOwnProperty('response3xxCount', 0);
    expect(context.res.stats).to.haveOwnProperty('response2xxCount', 0);
    expect(context.res.stats).to.haveOwnProperty('response1xxCount', 0);
    expect(context.res.stats).to.haveOwnProperty('responseInvalidCount', 0);
  });
});

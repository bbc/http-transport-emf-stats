import { expect } from 'chai';
import { initStats, initAttempt } from '../src/init';

describe('[src/init.js]', () => {
  describe('initStats', () => {
    it('should return the initial stats object', () => {
      const result = initStats();
      expect(result).to.be.deep.equal({
        attempts: [],
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
        cacheAudit: []
      });
    });
  });

  describe('initAttempt', () => {
    it('should return the initial attempt object with cache set to null if no emitter is set', () => {
      const result = initAttempt();
      expect(result).to.be.deep.equal({ cache: null, response: null });
    });

    it('should return the initial attempt object with cache initialised if emitter is set', () => {
      const emitter = {};
      const result = initAttempt(emitter);
      expect(result).to.be.deep.equal({
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
      });
    });
  });
});

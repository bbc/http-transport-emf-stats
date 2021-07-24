import { expect } from 'chai';
import { initStats } from '../src/init';

describe('[src/init.js]', () => {
  describe('initStats', () => {
    it('should return the initial stats object', () => {
      const result = initStats();
      expect(result).to.be.deep.equal({
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
    });
  });
});

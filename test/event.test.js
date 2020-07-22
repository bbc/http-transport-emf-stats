import sinon from 'sinon';
import { expect } from 'chai';
import * as util from '../src/util';
import { addCacheEventListener } from '../src/event';

describe('[src/event.js]', () => {
  it('should set the appropriate cache action to true', () => {
    const camelCaseResponse = 'testAction';
    sinon.stub(util, 'camelCase').returns(camelCaseResponse);
    const attempt = {
      cache: {}
    };
    const action = 'test.action';
    const cacheAudit = [];

    addCacheEventListener(attempt, action, cacheAudit);

    sinon.assert.calledOnceWithExactly(util.camelCase, action);
    expect(attempt).to.be.deep.equal({
      cache: {
        [camelCaseResponse]: true
      }
    });
    expect(cacheAudit).to.be.deep.equal([action]);
    sinon.restore();
  });
});

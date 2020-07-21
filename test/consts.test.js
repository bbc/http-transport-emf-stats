import { expect } from 'chai';
import { HTTP_5XX_RESPONSE, actions } from '../src/consts';

describe('[src/consts.js]', () => {
  it('HTTP_5XX_RESPONSE', () => {
    expect(HTTP_5XX_RESPONSE).to.be.equal('HTTP_5XX_RESPONSE');
  });

  it('actions', () => {
    expect(actions).to.be.deep.equal([
      'hit',
      'miss',
      'stale',
      'error',
      'timeout',
      'revalidate',
      'revalidate.error'
    ]);
  });
});

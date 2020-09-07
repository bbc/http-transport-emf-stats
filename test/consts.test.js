import { expect } from 'chai';
import { HTTP_5XX_RESPONSE, DEFAULT_OPTIONS } from '../src/consts';

describe('[src/consts.js]', () => {
  it('HTTP_5XX_RESPONSE', () => {
    expect(HTTP_5XX_RESPONSE).to.be.equal('HTTP_5XX_RESPONSE');
  });

  it('DEFAULT_OPTIONS', () => {
    expect(DEFAULT_OPTIONS).to.be.deep.equal({
      isCacheEnabled: true
    });
  });
});

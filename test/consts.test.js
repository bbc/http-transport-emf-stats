import { expect } from 'chai';
import { HTTP_5XX_RESPONSE } from '../src/consts';

describe('[src/consts.js]', () => {
  it('HTTP_5XX_RESPONSE', () => {
    expect(HTTP_5XX_RESPONSE).to.be.equal('HTTP_5XX_RESPONSE');
  });
});

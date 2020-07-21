import { expect } from 'chai';
import stats from '../src/index';

describe('[src/index.js]', () => {
  it('should ', () => {
    const emitter = {};
    const clientName = 'test';
    const plugin = stats(emitter, clientName);
    expect(plugin).to.be.a('function');
  });
});

import statsPlugin from './stats';

export default function stats(emitter, upstreamName) {
  console.log('stats.index.js');
  return statsPlugin.bind(this, emitter, upstreamName);
}

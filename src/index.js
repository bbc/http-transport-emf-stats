import statsPlugin from './stats';

export default function stats(emitter, upstreamName) {
  return statsPlugin.bind(this, emitter, upstreamName);
}

import statsPlugin from './stats';

export default function stats(emitter, clientName) {
  return statsPlugin.bind(this, emitter, clientName);
}

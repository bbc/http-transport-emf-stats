import statsPlugin from './stats';

export default function stats(options) {
  return statsPlugin.bind(this, options);
}

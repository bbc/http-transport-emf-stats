import statsPlugin from './stats';

export default function stats() {
  return statsPlugin.bind(this);
}

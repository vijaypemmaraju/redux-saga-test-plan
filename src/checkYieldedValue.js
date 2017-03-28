// @flow
import { utils } from 'redux-saga';
import parseEffect from './parseEffect';

import {
  ACTION_CHANNEL,
  CALL,
  CANCEL,
  CANCELLED,
  CPS,
  FLUSH,
  FORK,
  JOIN,
  PUT,
  RACE,
  SELECT,
  TAKE,
} from './keys';

const { asEffect } = utils;

export const NO_FAKE_VALUE = Object.create(null);
export const noFakeValue = () => NO_FAKE_VALUE;

const handlers = {
  [ACTION_CHANNEL]: 'actionChannel',
  [CALL]: 'call',
  [CANCEL]: 'cancel',
  [CANCELLED]: 'cancelled',
  [CPS]: 'cps',
  [FLUSH]: 'flush',
  [FORK](providers, value) {
    const effect = asEffect.fork(value);

    if (providers.fork && !effect.detached) {
      return providers.fork(effect, noFakeValue);
    }

    if (providers.spawn && effect.detached) {
      return providers.spawn(effect, noFakeValue);
    }

    return NO_FAKE_VALUE;
  },
  [JOIN]: 'join',
  [PUT]: 'put',
  [RACE]: 'race',
  [SELECT]: 'select',
  [TAKE]: 'take',
};

export function checkYieldedValue(providers: Providers, value: Object) {
  if (providers) {
    const effectType = parseEffect(value);
    const handler = handlers[effectType];

    if (typeof handler === 'string' && handler in providers) {
      const effect = asEffect[handler](value);
      return providers[handler](effect, noFakeValue);
    }

    if (typeof handler === 'function') {
      return handler(providers, value);
    }
  }

  return NO_FAKE_VALUE;
}

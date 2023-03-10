/* eslint-disable prettier/prettier */
import { createEvent, Event } from 'effector';

import { FSA_StateNode } from '.';

const LEAVE_HOME = createEvent();
const ARIVE_HOME = createEvent();
const SPEED_UP = createEvent();
const SLOW_DOWN = createEvent();
const STOP = createEvent();
const SUDDEN_STOP = createEvent();
const SUDDEN_SPEED_UP = createEvent();

// https://xstate.js.org/docs/guides/introduction-to-state-machines-and-statecharts/#compound-states
export const fileMachine: FSA_Config = {
  initial: 'waiting',
  states: {
    waiting: {
      on: [
        [LEAVE_HOME, 'on_a_walk']
      ]
    },
    on_a_walk: {
      initial: 'walking',
      on: [
        [ARIVE_HOME, 'walk_home'] 
      ],
      states: {
        walking: {
          on: [
            [SPEED_UP, 'running'],
            [STOP, 'stopping_to_sniff']
          ]
        },
        running: {},
        stopping_to_sniff: {},
      },
    },
    walk_home: {},
  },
};

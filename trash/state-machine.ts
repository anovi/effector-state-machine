import { createEvent, createStore, Event, Store } from 'effector';

interface FSA_Config {
  state: Store<any>;
  data: Store<any>;
  transitions: any[];
  actions: any[];
  guards: any[];
  events: any[];
}

type StateNode = [string, StepConfig, StateChart];
type TransitionNode = [Event<void>, string | Conditional][];
type StateChart = (TransitionNode | StateNode)[];

type Conditional = {
  [key: string]: string;
};

function state(
  name: string,
  second: boolean | StateChart,
  third?: StateChart
): StateNode {
  const config: StepConfig = { initial: false };
  if (typeof second === 'boolean') config.initial = second;
  const chart = typeof second === 'object' && 'push' in second ? second : third;
  if (undefined === chart) throw Error('Pass a chart');
  return [name, config, chart];
}

type StateFn = typeof state;

type StepConfig = {
  initial: boolean;
};

function stateMachine(
  data: { [key: string]: any },
  cb: (state: StateFn) => StateChart
) {
  const result = cb(state);
  console.log(result);
}

/* ========================== */

// dog example
const leaveHome = createEvent();
const ariveHome = createEvent();
const speedUp = createEvent();
const slowDown = createEvent();
const stop = createEvent();
const suddenStop = createEvent();
const suddenSpeedUp = createEvent();

stateMachine(
  {
    lala: 'fa',
  },
  state => {
    return [
      state('WAITING', true, [[leaveHome, 'ON_A_WALK']]),
      state('ON_A_WALK', [
        [ariveHome, 'WALK_COMPLETE'],

        state('WALKING', true, [
          [speedUp, 'RUNNING'],
          [
            stop,
            {
              ifSuperDuper: 'STOPPING_TO_SNIFF',
              else: 'STOPPING_TO_SNIFF',
            },
          ],
        ]),
        state('RUNNING', [
          [suddenStop, 'STOPPING_TO_SNIFF'],
          [slowDown, 'WALKING'],
        ]),
        state('STOPPING_TO_SNIFF', [
          [suddenSpeedUp, 'RUNNING'],
          [speedUp, 'WALKING'],
        ]),
      ]),
      state('WALK_COMPLETE'),
    ];
  }
);

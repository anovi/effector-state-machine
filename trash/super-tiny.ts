/* eslint-disable prettier/prettier */
import { createEvent, Event } from 'effector';


const leaveHome = createEvent();
const ariveHome = createEvent();
const speedUp = createEvent();
const slowDown = createEvent();
const stop = createEvent();
const suddenStop = createEvent();
const suddenSpeedUp = createEvent();

type MapKey = string | Event<any>;
type MapVal = string | StateNode | null;
type StateNode = Map<MapKey, MapVal>;
type MakeNodeParams = [MapKey, MapVal][];

function __(params: MakeNodeParams) {
  return new Map<MapKey, MapVal>(params);
}

const scheme = __([
  ['initial', 'WAITING'],
  ['states', __([
    ['WAITING', __([
      [leaveHome, 'ON_A_WALK'],
    ])],
    ['ON_A_WALK', __([
      ['initial', 'WALKING'],
      [ariveHome, 'WALK_HOME'],
      ['states', __([
        ['WALKING', __([
          [speedUp, 'RUNNING'],
          [stop, 'STOPPING_TO_SNIFF'],
        ])],
        ['RUNNING', null],
        ['STOPPING_TO_SNIFF', null],
      ])]
    ])]
  ])]
]);
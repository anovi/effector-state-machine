/* eslint-disable prettier/prettier */
import { createEvent, createStore, Event, Store } from 'effector';
import { reduce } from 'lodash';

export interface FSA_Config {
  initial: string;
  states: FSA_States;
  on?: FSA_Trigger;
}
type FSA_StateNode = FSA_Config | { on?: FSA_Trigger };

type FSA_States = { [key: string]: FSA_StateNode };

interface FSA_Trigger {
  event: Event<any>;
  target: string;
}

type StateVaule = string[];

function buildInitialState(data: FSA_Config): string[] {
  function readStates(states: FSA_States, parent?: string): string[] {
    const result: string[] = [];
    return reduce(states, (memo, curr, stateName) => {
      if ('initial' in curr && stateName === parent) {
        return memo.concat(readConfig(curr))
      }
      return memo;
    }, result);
  }
  function readConfig(config: FSA_Config): string[] {
    const children = config.states;
    return [config.initial, ...readStates(children, config.initial)];
  }
  return readConfig(data);
}

function buildStore(initialState: string[]) {
  return createStore(initialState);
}

export function createMachine(config: FSA_Config): Store<string[]> {
  /**
  * For states 
  * - create a state tree
  * For on
  * - create map of effects
  */
  const initialState = buildInitialState(config);
  const store = buildStore(initialState);
  return store;
}
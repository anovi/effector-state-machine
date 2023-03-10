/* eslint-disable prettier/prettier */
import { createEvent, createStore, Event, Store } from 'effector';
import { reduce, forEach } from 'lodash';

let globalConfig: FSA_StateNode;

export type FSA_StateNode = {
  initial: string;
  states: FSA_States;
  on?: FSA_Trigger[];
} | { on?: FSA_Trigger[] }

type FSA_States = { [key: string]: FSA_StateNode };

type FSA_Trigger = [Event<any>, string];

type StateValue = string[];

type Reducer = (state: StateValue) => StateValue;



function buildInitialState(data: FSA_StateNode): StateValue {
  function readStates(states: FSA_States, parent?: string): string[] {
    const result: string[] = [];
    return reduce(states, (memo, curr, stateName) => {
      if ('initial' in curr && stateName === parent) {
        return memo.concat(readConfigInitial(curr))
      }
      return memo;
    }, result);
  }

  function readConfigInitial(config: FSA_StateNode): string[] {
    if (!('initial' in config)) throw Error('No initial state');
    const children = config.states;
    return [config.initial, ...readStates(children, config.initial)];
  }
  return readConfigInitial(data);
}

function equalState(state1: StateValue, state2: StateValue): boolean {
  return state1.join('.') === state2.join('.');
}

function isTransitionAllowed(config: FSA_StateNode, to: StateValue): boolean {
  if (!('states' in config)) return false;
  function walk(states: FSA_States, parents: string[], to: StateValue): boolean {
    const target = to[0];
    const rest = to.slice(1);
    const state = states[target];
    if (!state) return false;
    if ('states' in state) {
      return walk(state.states, [...parents, target], rest);
    }
    if (rest.length === 0) {
      return true;
    }
    return false;
  }
  return walk(config.states, [], to);
}

function buildStore(initialState: StateValue) {
  return createStore<StateValue>(initialState);
}

const transitions = new Map<Event<any>, Reducer[]>();

interface TransitionProps {
  store: Store<StateValue>;
  event: Event<any>;
  from: StateValue;
  to: StateValue;
  /** Allowed states on the same level */
  states: FSA_States;
  parents: string[];
}

function createTransition(props: TransitionProps): void {
  // make a reducer
  const reducer = function(state: StateValue) {
    // check if transition from is possible
    debugger;
    if (equalState(props.from, state)) {
      // check if target state is possible
      if (isTransitionAllowed(globalConfig, props.to)) {
        console.log('TRANSITION:', props.from, '===>', props.to);
        return props.to;
      }
    }
    return state;
  }
  let reducers = transitions.get(props.event);
  // debugger;
  if (!reducers) {
    reducers = [];
    reducers.push(reducer);
    transitions.set(props.event, reducers);
    // create one master reducer for all event occassions
    props.store.on(props.event, masterReducer.bind(null, props.event));
  } else {
    reducers.push(reducer);
  }
}


function masterReducer(event: Event<any>, state: StateValue) {
  const reducers = transitions.get(event);
  if (reducers) {
    const newState = reducers.reduce((memo, curr) => {
      if (state !== memo) return memo;
      return curr(memo);
    }, state);
    return newState;
  }
  return state;
}


function createTransitions(store: Store<StateValue>, config: FSA_StateNode): void {
  globalConfig = config;

  function readStates(states: FSA_States, parents: string[] = []) {
    // const result: string[] = [];
    forEach(states, (curr, stateName) => {
      if ('states' in curr) {
        readConfigInitial(curr, [...parents, stateName]);
      }
      if ('on' in curr && curr.on) {
        curr.on.forEach((transition) => {
          const event = transition[0];
          const target = transition[1];
          createTransition({
            store,
            event,
            from: [...parents, stateName],
            to: [...parents, target],
            states,
            parents
          });
        })
      }
    });
  }

  function readConfigInitial(config: FSA_StateNode, parents?: string[]) {
    if (!('initial' in config)) throw Error('No initial state');
    const states = config.states;
    const initial = config.initial;
    readStates(states, parents);

    if ('on' in config && config.on) {
      config.on.forEach((transition) => {
        const event = transition[0];
        const target = transition[1];
        createTransition({
          store,
          event,
          from: [initial, ...buildInitialState(states[initial])],
          to: [target, ...buildInitialState(states[target])],
          states,
          parents: [],
        });
      })
    }
  }

  readConfigInitial(config);
}


export function createMachine(config: FSA_StateNode): Store<StateValue> {
  /**
  * For states 
  * - create a state tree
  * For on
  * - create map of effects
  */
  const initialState = buildInitialState(config);
  const store = buildStore(initialState);
  createTransitions(store, config);
  return store;
}
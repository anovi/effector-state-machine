/* eslint-disable prettier/prettier */
import { createStore, Event, Store } from 'effector';
import { reduce, forEach } from 'lodash';
import { StateValue, StateValueNode, flattenState, StateValueBuilder } from './state';
import { buildPossibleStates } from './possible-states';
import {
    SMC_StateNode,
    SMC_States,
    TransitionProps,
    StateAdress,
} from './config'


type Reducer = (state: StateValue) => StateValue;


function equalState(state1: StateValue, state2: StateValue): boolean {
  return state1.join('.') === state2.join('.');
}

function isTransitionTargetAllowed(config: SMC_StateNode, to: string[]): boolean {
  if (!('states' in config)) return false;
  function walk(states: SMC_States, parents: string[], to: string[]): boolean {
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

function isTransitionFromAllowed(from: StateAdress, current: StateValue): boolean {
  const possible = flattenState(current);
  return possible.includes(from.join('.'));
}


/**
 * Class StateMachine
 */
export default class StateMachine {
 
  store: Store<StateValue>;

  transitions: Map<Event<any>, Reducer[]>;

  config: SMC_StateNode;

  possible: string[][];

  private initial: StateValue;


  constructor(config: SMC_StateNode) {
    this.transitions = new Map();
    this.config = config;
    this.possible = buildPossibleStates(config);
    this.initial = this.buildInitialState(config);
    this.store = this.buildStore(this.initial);
    this.createTransitions(config);
  }


  private buildInitialState(data: SMC_StateNode): StateValue {
    function readStates(states: SMC_States, parent?: string): StateValue {
      const result: StateValue = [];
      return reduce(states, (memo, curr, stateName) => {
        if ('initial' in curr && stateName === parent) {
          const node: StateValueNode = {
            state: stateName,
            child: readConfigInitial(curr),
          };
          memo.push(node);
        }
        return memo;
      }, result);
    }
    function readConfigInitial(config: SMC_StateNode): StateValue {
      if (!('initial' in config)) throw Error('No initial state in StateNode').stack = config.toString();
      const children = config.states;
      const node: StateValueNode = {
        state: config.initial,
        child: readStates(children, config.initial),
      };
      return [
        node
      ];
    }
    return readConfigInitial(data);
  }


  private buildInitialStateAdress(data: SMC_StateNode): string[] {
    function readStates(states: SMC_States, parent?: string): string[] {
      const result: string[] = [];
      return reduce(states, (memo, curr, stateName) => {
        if ('initial' in curr && stateName === parent) {
          return memo.concat(readConfigInitial(curr))
        }
        return memo;
      }, result);
    }
  
    function readConfigInitial(config: SMC_StateNode): string[] {
      if (!('initial' in config)) throw Error('No initial state');
      const children = config.states;
      return [config.initial, ...readStates(children, config.initial)];
    }
    return readConfigInitial(data);
  }


  private buildStore(initialState: StateValue) {
    return createStore<StateValue>(initialState);
  }


  private createTransition(props: TransitionProps): void {
    const config = this.config;
    // make a reducer
    const reducer = function(state: StateValue): StateValue {
      // check if transition from is possible
      // debugger;
      if (isTransitionFromAllowed(props.from, state)) {
        // check if target state is possible
        if (isTransitionTargetAllowed(config, props.to)) {
          console.log('TRANSITION:', props.from, '===>', props.to);
          // TODO make a transition
          return props.to;
        }
      }
      return state;
    }
    let reducers = this.transitions.get(props.event);
    // debugger;
    if (!reducers) {
      reducers = [];
      reducers.push(reducer);
      this.transitions.set(props.event, reducers);
      // create one master reducer for all event occassions
      props.store.on(props.event, this.masterReducer.bind(this, props.event));
    } else {
      reducers.push(reducer);
    }
  }
  
  
  private masterReducer(event: Event<any>, state: StateValue) {
    const reducers = this.transitions.get(event);
    if (reducers) {
      const newState = reducers.reduce((memo, curr) => {
        if (state !== memo) return memo;
        return curr(memo);
      }, state);
      return newState;
    }
    return state;
  }
  
  
  private createTransitions(config: SMC_StateNode): void {
  
    const readStates = (states: SMC_States, parents: string[] = []) => {
      forEach(states, (curr, stateName) => {
        if ('states' in curr) {
          readConfigInitial(curr, [...parents, stateName]);
        }
        if ('on' in curr && curr.on) {
          curr.on.forEach((transition) => {
            const event = transition[0];
            const target = transition[1];
            this.createTransition({
              store: this.store,
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
  
    const readConfigInitial = (config: SMC_StateNode, parents?: string[]) => {
      if (!('initial' in config)) throw Error('No initial state');
      const states = config.states;
      const initial = config.initial;
      readStates(states, parents);
  
      if ('on' in config && config.on) {
        config.on.forEach((transition) => {
          const event = transition[0];
          const target = transition[1];
          this.createTransition({
            store: this.store,
            event,
            from: [initial, ...this.buildInitialStateAdress(states[initial])],
            to: [target, ...this.buildInitialStateAdress(states[target])],
            states,
            parents: [],
          });
        })
      }
    }
  
    readConfigInitial(config);
  }


  getState(): StateValue {
    return this.store.getState();
  }

}
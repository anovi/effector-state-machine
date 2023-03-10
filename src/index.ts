import { SMC_StateNode } from './config';
import StateMachine from './state-machine';

export {
  SMC_StateNode,
  SMC_States,
  StateValue,
  TransitionProps
} from './config'

export function createMachine(config: SMC_StateNode): StateMachine {
  const machine = new StateMachine(config);
  return machine;
}

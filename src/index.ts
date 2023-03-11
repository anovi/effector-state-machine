import { SMC_StateNode } from './config';
import StateMachine from './state-machine';

export { StateValue, StateValueNode } from './state';

export { SMC_StateNode, SMC_States, TransitionProps } from './config';

export function createMachine(config: SMC_StateNode): StateMachine {
  const machine = new StateMachine(config);
  return machine;
}

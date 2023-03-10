import { Event, Store } from 'effector';

/* SMC — State Machine Config */

export type SMC_StateNode =
  | {
      initial: string;
      states: SMC_States;
      on?: SMC_Trigger[];
    }
  | { on?: SMC_Trigger[] };

export type SMC_States = { [key: string]: SMC_StateNode };

type SMC_Trigger = [Event<any>, string];

export type StateValue = string[];

export interface TransitionProps {
  store: Store<StateValue>;
  event: Event<any>;
  from: StateValue;
  to: StateValue;
  /** Allowed states on the same level */
  states: SMC_States;
  parents: string[];
}

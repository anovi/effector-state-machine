import { Event, Store } from 'effector';
import { StateValue } from './state';

/* SMC — State Machine Config */
export type StateAdress = string[];

export type SMC_StateNode =
  | {
      parallel: boolean;
      states: SMC_States;
      on?: SMC_Trigger[];
    }
  | {
      initial: string;
      states: SMC_States;
      on?: SMC_Trigger[];
    }
  | { on?: SMC_Trigger[] };

export type SMC_States = { [key: string]: SMC_StateNode };

type SMC_Trigger = [Event<any>, string];

export interface TransitionProps {
  store: Store<StateValue>;
  event: Event<any>;
  from: string[];
  to: string[];
  /** Allowed states on the same level */
  states: SMC_States;
  parents: string[];
}

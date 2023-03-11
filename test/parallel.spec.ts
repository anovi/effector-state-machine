import { SMC_StateNode, createMachine } from '../src';
import { createEvent } from 'effector';
import { buildPossibleStates } from '../src/possible-states';
import { flattenState, StateValue } from '../src/state';

describe('possible-states', () => {
  describe('simple parallel', () => {
    const INIT_UPLOAD = createEvent();
    const UPLOAD_COMPLETE = createEvent();
    const INIT_DOWNLOAD = createEvent();
    const DOWNLOAD_COMPLETE = createEvent();
    const SWITCH = createEvent();

    const fileMachine: SMC_StateNode = {
      // id: 'file',
      parallel: true,
      initial: 'upload',
      on: [
        [SWITCH, 'download'],
        [SWITCH, 'upload'],
      ],
      states: {
        upload: {
          initial: 'idle',
          states: {
            idle: {
              on: [[INIT_UPLOAD, 'pending']],
            },
            pending: {
              on: [[UPLOAD_COMPLETE, 'success']],
            },
            success: {},
          },
        },
        download: {
          initial: 'idle',
          states: {
            idle: {
              on: [[INIT_DOWNLOAD, 'pending']],
            },
            pending: {
              on: [[DOWNLOAD_COMPLETE, 'success']],
            },
            success: {},
          },
        },
      },
    };

    it('should return possible states', () => {
      // const result = createMachine(fileMachine);
      // expect(result.getState()).toEqual(['upload', 'idle']);
      const states = buildPossibleStates(fileMachine);
      console.log(states);
      expect(states.length).toEqual(6);
    });
  });

  describe.skip('parallel on the deeper level', () => {
    const INIT_UPLOAD = createEvent();
    const UPLOAD_COMPLETE = createEvent();
    const INIT_DOWNLOAD = createEvent();
    const DOWNLOAD_COMPLETE = createEvent();
    const SWITCH = createEvent();

    const fileMachine: SMC_StateNode = {
      // id: 'file',
      initial: 'upload',
      on: [
        [SWITCH, 'download'],
        [SWITCH, 'upload'],
      ],
      states: {
        upload: {
          initial: 'idle',
          parallel: true,
          states: {
            idle: {
              on: [[INIT_UPLOAD, 'pending']],
            },
            pending: {
              on: [[UPLOAD_COMPLETE, 'success']],
            },
            success: {},
          },
        },
        download: {
          initial: 'idle',
          states: {
            idle: {
              on: [[INIT_DOWNLOAD, 'pending']],
            },
            pending: {
              on: [[DOWNLOAD_COMPLETE, 'success']],
            },
            success: {},
          },
        },
      },
    };

    it('should return possible states', () => {
      // const result = createMachine(fileMachine);
      // expect(result.getState()).toEqual(['upload', 'idle']);
      const states = buildPossibleStates(fileMachine);
      console.log(states);
      expect(states.length).toEqual(6);
    });
  });
});

describe('flattenState', () => {
  describe('simple parallel', () => {
    it('should flatten simple state', () => {
      // eslint-disable-next-line prettier/prettier
      const state: StateValue = [
        {state: 'one', child: [
          {state: 'two'}
        ]}
      ];
      const result = flattenState(state);
      expect(result).toEqual(['one.two']);
    });
  });

  describe('parallel on the deeper level', () => {
    it('should flatten complex parallel state', () => {
      // eslint-disable-next-line prettier/prettier
      const state: StateValue = [
        { state: 'one' },
        // eslint-disable-next-line prettier/prettier
        { state: 'two', child: [
          { state: 'three' },
          { state: 'four' }
        ]}
      ];
      const result = flattenState(state);
      expect(result).toEqual(['one', 'two.three', 'two.four']);
    });
  });
});

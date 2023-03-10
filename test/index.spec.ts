import { SMC_StateNode, createMachine } from '../src';
import { createEvent } from 'effector';

describe('index', () => {
  describe('myPackage', () => {
    const INIT_UPLOAD = createEvent();
    const UPLOAD_COMPLETE = createEvent();
    const INIT_DOWNLOAD = createEvent();
    const DOWNLOAD_COMPLETE = createEvent();
    const SWITCH = createEvent();

    const fileMachine: SMC_StateNode = {
      // id: 'file',
      // type: 'parallel',
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

    it('should return state [upload, idle]', () => {
      const result = createMachine(fileMachine);
      expect(result.getState()).toEqual(['upload', 'idle']);
    });

    it('should change state to [upload, pending]', () => {
      const result = createMachine(fileMachine);
      INIT_UPLOAD();
      expect(result.getState()).toEqual(['upload', 'pending']);
    });

    it('should switch to [download, idle]', () => {
      const result = createMachine(fileMachine);
      SWITCH();
      expect(result.getState()).toEqual(['download', 'idle']);
    });

  });
});

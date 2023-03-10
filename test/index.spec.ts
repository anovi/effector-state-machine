import { FSA_Config, createMachine } from '../src';
import { createEvent } from 'effector';

describe('index', () => {
  describe('myPackage', () => {
    const INIT_UPLOAD = createEvent();
    const UPLOAD_COMPLETE = createEvent();
    const INIT_DOWNLOAD = createEvent();
    const DOWNLOAD_COMPLETE = createEvent();

    const fileMachine: FSA_Config = {
      // id: 'file',
      // type: 'parallel',
      initial: 'upload',
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
      expect(result.getState()).toEqual(['upload', 'idle']);
    });
  });
});

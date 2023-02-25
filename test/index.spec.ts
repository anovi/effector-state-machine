import { FSA_Config, createMachine } from '../src';
import { createEvent } from 'effector';

describe('index', () => {
  describe('myPackage', () => {
    it('should return state [upload, idle]', () => {
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
                on: {
                  event: INIT_UPLOAD,
                  target: 'pending',
                },
              },
              pending: {
                on: {
                  event: UPLOAD_COMPLETE,
                  target: 'success',
                },
              },
              success: {},
            },
          },
          download: {
            initial: 'idle',
            states: {
              idle: {
                on: {
                  event: INIT_DOWNLOAD,
                  target: 'pending',
                },
              },
              pending: {
                on: {
                  event: DOWNLOAD_COMPLETE,
                  target: 'success',
                },
              },
              success: {},
            },
          },
        },
      };

      const result = createMachine(fileMachine);
      expect(result.getState()).toEqual(['upload', 'idle']);
    });
  });
});

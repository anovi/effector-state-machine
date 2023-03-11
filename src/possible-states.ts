import { SMC_StateNode } from './config';
// import {StateValue} from './state';

export function buildPossibleStates(config: SMC_StateNode): string[][] {
  function walk(config: SMC_StateNode, parents: string[]): string[][] {
    const result: string[][] = [];
    if ('states' in config) {
      const { states } = config;
      // const parallel = config.parallel;
      Object.keys(states).forEach((stateName) => {
        const state = states[stateName];
        const adress = [...parents, stateName];
        if ('states' in state) {
          result.push(...walk(state, adress));
        } else {
          result.push(adress);
        }
      });
    } else {
      result.push(parents);
    }
    return result;
  }
  return walk(config, []);
}

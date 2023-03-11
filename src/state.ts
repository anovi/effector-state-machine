// import {StateValue} from '.';

export type StateValue = StateValueNode[];

export type StateValueNode = {
  state: string;
  child?: StateValue;
};

type FlattenStateValue = string[];

interface Builder {
  reset(): void;
  branch(stateName: string): void;
  dive(branchIndex: number): void;
  setChildren(children: StateValue): void;
  get(): StateValue;
}

export class StateValueBuilder implements Builder {
  private state: StateValue = [];

  private cursor: StateValueNode | null = null;

  constructor() {
    this.reset();
  }

  branch(state: string): void {
    this.state.push({
      state,
    });
  }

  dive(branchIndex: number): void {
    this.cursor = this.state[branchIndex];
  }

  setChildren(children: StateValue): void {
    if (!this.cursor) throw Error('Cursor is not set');
    if (this.cursor.child) {
      this.cursor.child = this.cursor.child.concat(children);
      return;
    }
    this.cursor.child = children;
  }

  reset(): void {
    this.state = [];
    this.cursor = null;
  }

  get(): StateValue {
    return this.state;
  }
}

export function flattenState(state: StateValue): FlattenStateValue {
  const branches: string[][] = [[]];
  function walk(state: StateValue, parents: string[], branch: number): void {
    state.forEach((node, index) => {
      // for first need to keep branch
      if (index === 0) {
        branches[branch].push(node.state);
        if (node.child) {
          walk(node.child, [...parents, node.state], branch);
        }
      } else {
        // for next need to create new branches
        makeBranch(node, parents);
      }
    });
  }
  function readNode(node: StateValueNode, parents: string[], branch: number) {
    branches[branch].push(node.state);
    if (node.child) {
      walk(node.child, [...parents, node.state], branch);
    }
  }
  function makeBranch(node: StateValueNode, parents: string[]) {
    const id = branches.length;
    branches.push([...parents]);
    readNode(node, parents, id);
  }
  walk(state, [], 0);
  return branches.map((branch) => branch.join('.'));
}

/*
one
<branched>
two
two.three - result
<branched>
two.four - result
*/

/*
# State with objects

## Simple state
[
  {state: 'one', child: [
    {state: 'two'}
  ]}
]

## Parallel state
[
  {state: 'one'},
  {state: 'two', child: [
    {state: 'three'},
    {state: 'four'}
  ]}
]
*/

/*
# State with objects

## Simple state
[
  ['one', [
    ['two']
  ]]
]

## Parallel state
[
  ['one'],
  ['two', [
    ['three'],
    ['four']
  ]]
]
*/

/*
# State with array

## Simple state
['one', 'two']

## Parallel state
['one', ['two', 'three']]
*/

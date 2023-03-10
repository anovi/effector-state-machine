// import {StateValue} from '.';

type StateValue = StateValueNode[];

type StateValueNode = {
  state: string;
  child?: StateValue;
};

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
# State with array

## Simple state
['one', 'two']

## Parallel state
['one', ['two', 'three']]
*/

/*
# State with strings and arrays

## Simple state
'one.two'

## Parallel state
'

*/

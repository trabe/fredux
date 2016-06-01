import { PROMISE_CALL, SET_INTERVAL, UNSET_INTERVAL } from "./symbols";

const is = fn => (action, type) => fn(action.type) === type;

// Promise Action Decorator
export const promiseAction = call => action => ({ ...action, [PROMISE_CALL]: call });

// Promise Action Types
export const requestType = type => `${type}_REQUEST`;
export const successType = type => `${type}_SUCCESS`;
export const failureType = type => `${type}_FAILURE`;
export const isRequestType = is(requestType);
export const isSuccessType = is(successType);
export const isFailureType = is(failureType);

// Context Changing Action decorator
export const contextChangingAction = action => ({ ...action, meta: { ...action.meta, changeVersion: true } });

// Interval Action decorators
export const startIntervalAction = ({ timeout, id }) => action => ({ ...action, [SET_INTERVAL]: { id, timeout } });
export const stopIntervalAction = id => action => ({ ...action, [UNSET_INTERVAL]: id });

// Interval Action types
export const startType = type => `${type}_START`;
export const stopType = type => `${type}_STOP`;
export const isStartType = is(startType);
export const isStopType = is(stopType);

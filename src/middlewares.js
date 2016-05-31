import { PROMISE_CALL, SET_INTERVAL, UNSET_INTERVAL } from "./symbols";
import { startType, stopType, requestType, successType, failureType } from "./actions";

function deleteApiCall(action) {
  const newAction = {...action};
  delete newAction[PROMISE_CALL];
  return newAction;
}

function getVersion(store) {
  return store.getState().version;
}

export const promiseActionMiddleware = store => next => {
  let i = 0;

  function nextId() {
    return ++i;
  }

  return action => {
    const promiseCall = action[PROMISE_CALL];

    if (!promiseCall) {
      return next(action);
    }

    const version = getVersion(store);
    const id = nextId();

    store.dispatch(deleteApiCall({ ...action, meta: { ...action.meta, id, version }, type: requestType(action.type) }));
    promiseCall().then(
      response => store.dispatch(deleteApiCall({
        ...action,
        type: successType(action.type),
        payload: { ...action.payload, response },
        meta: { ...action.meta, id, version }
      })),

      error => store.dispatch(deleteApiCall({
        ...action,
        type: failureType(action.type),
        error: true,
        payload: error,
        meta: { ...action.meta, id, version }
      }))
    );
  }
};

export const versionMiddleware = store => next => action => {
  const meta = action.meta || {};
  if (meta.version === undefined || meta.version === getVersion(store)) {
    next(action);
  }
};

// TODO: Add some kind of validation when starting two pollers with the same id/stopping a poller that does not exist
export const intervalMiddleware = store => next => {
  const intervals = new Map();
  return action => {
    if (action[SET_INTERVAL]) {
      const { timeout, id } = action[SET_INTERVAL];
      if (!intervals.has(id)) {
        store.dispatch({ type: startType(action.type), meta: { id, timeout } });
        const interval = setInterval(() => store.dispatch(action), timeout);
        intervals.set(id, interval);
      }
    }
    else if (action[UNSET_INTERVAL]) {
      const id = action[UNSET_INTERVAL];
      if (intervals.has(id)) {
        clearInterval(intervals.get(id));
        intervals.delete(id);
        store.dispatch({ type: stopType(action.type), meta: { id } });
      }
    }
    else {
      next(action);
    }
  };
};

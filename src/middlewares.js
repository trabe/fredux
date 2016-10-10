import { PROMISE_CALL, CHANGE_VERSION } from "./symbols";
import { startType, stopType, requestType, successType, failureType } from "./actions";

function deleteApiCall(action) {
  const newAction = { ...action };
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
        payload: { ...action.payload, error },
        meta: { ...action.meta, id, version }
      }))
    );
  }
};

export const versionMiddleware = store => next => action => {
  const meta = action.meta || {};
  if (meta.version === undefined || meta.version === getVersion(store)) {
    next(action[CHANGE_VERSION] ? {...action, meta: {...action.meta, changeVersion: true}} : action);
  }
};

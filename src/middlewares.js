import { ASYNC_CALL } from "./symbols";

function deleteApiCall(action) {
  const newAction = {...action}
  delete newAction[ASYNC_CALL];
  return newAction;
}

function getVersion(store) {
  return store.getState().version;
}

export const asyncActionMiddleware = store => next => {
  let i = 0;

  function nextId() {
    return ++i;
  }

  return action => {
    const apiCall = action[ASYNC_CALL];

    if (!apiCall) {
      return next(action);
    }

    const { request, types } = apiCall;
    const version = getVersion(store);
    const id = nextId();

    store.dispatch(deleteApiCall({ ...action, meta: { ...action.meta, id, version }, type: types.REQUEST.TYPE }));
    request().then(
      response => store.dispatch(deleteApiCall({
        ...action,
        type: types.SUCCESS.TYPE,
        payload: { ...action.payload, ...response },
        meta: { ...action.meta, id, version }
      })),

      error => store.dispatch(deleteApiCall({
        ...action,
        type: types.FAILURE.TYPE,
        error: true,
        payload: error,
        meta: { ...action.meta, id, version }
      }))
    );
  }
}

export const versionMiddleware = store => next => action => {
  const meta = action.meta || {};
  if (meta.version === undefined || meta.version === getVersion(store)) {
    next(action);
  }
};

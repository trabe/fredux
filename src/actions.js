import { ASYNC_CALL } from "./symbols";

function setChangeVersionMeta(changeVersion, action) {
  if (changeVersion) {
    action.meta = { changeVersion };
  }

  return action;
};

const decorateActionCreator = fn => actionCreator => (...args) => {
  const creator = actionCreator(...args);

  return {
    ...creator,
    create: (...args) => fn(creator.create(...args))
  }
};

export const contextChangingAction = decorateActionCreator(action => ({...action, meta: {...action.meta, changeVersion: true}}));

export function asyncAction({ type, request, builder = o => o }) {
  const types = {
    REQUEST: { TYPE: `${type}_REQUEST` },
    SUCCESS: { TYPE: `${type}_SUCCESS` },
    FAILURE: { TYPE: `${type}_FAILURE` }
  };
  return {
    ...types,
    create: (props) => ({
        [ASYNC_CALL]: {
          types,
          request: request.bind(this, props)
        },
        payload: builder(props)
      })
  }
}

export function syncAction({ type, builder = o => o }) {
  return {
    TYPE: type,
    create: (props) => ({
      type,
      payload: builder(props)
    })
  }
}

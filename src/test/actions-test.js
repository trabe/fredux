import expect from "expect";
import * as actions from "../actions";
import { ASYNC_CALL } from "../symbols";

describe('actions', () => {

  describe('syncAction', () => {
    const TYPE = 'SYNC_ACTION'

    it('should create a sync action definition', () => {

      expect(actions.syncAction({
        type: TYPE,
        changeVersion: true,
        builder: (x,y) => x+y
      }).TYPE).toEqual(TYPE)
    })

    it('should create a sync action', () => {

      const syncAction = {
        type: TYPE,
        meta: {changeVersion: true},
        payload: 3
      }

      expect(actions.syncAction({
        type: TYPE,
        changeVersion: true,
        builder: (x,y) => x+y
      }).create(1, 2)).toEqual(syncAction)
    })
  })

  describe('asyncAction', () => {
    const TYPE = 'ASYNC_ACTION'
    const types = {
      REQUEST: { TYPE: `${TYPE}_REQUEST` },
      SUCCESS: { TYPE: `${TYPE}_SUCCESS` },
      FAILURE: { TYPE: `${TYPE}_FAILURE` }
    }

    it('should create an async action definition', () => {
      const actionDefinition = actions.asyncAction({
        type: TYPE,
        changeVersion: true,
        builder: (x,y) => x+y
      })

      expect(actionDefinition.REQUEST).toEqual(types.REQUEST);
      expect(actionDefinition.SUCCESS).toEqual(types.SUCCESS);
      expect(actionDefinition.FAILURE).toEqual(types.FAILURE);
    })

    it('should create an async action', () => {
      const request = 'fake request';
      const asyncAction = {
        [ASYNC_CALL]: {
          types,
          request: request
        },
        meta: {changeVersion: true},
        payload: 3
      }

      expect(actions.asyncAction({
        type: TYPE,
        request: request,
        changeVersion: true,
        builder: (x,y) => x+y
      }).create(1, 2)).toEqual(asyncAction)
    })
  })

})

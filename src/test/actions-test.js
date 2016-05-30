import expect from "expect";
import * as actions from "../actions";
import { ASYNC_CALL } from "../symbols";

describe("actions", () => {

  describe("syncAction", () => {
    const TYPE = "SYNC_ACTION";

    it("should create a sync action definition", () => {
      expect(actions.syncAction({
        type: TYPE,
        builder: ({ x, y }) => x + y
      }).TYPE).toEqual(TYPE)
    });

    it("should create a sync action", () => {
      const syncAction = {
        type: TYPE,
        payload: 3
      };

      expect(actions.syncAction({
        type: TYPE,
        builder: ({ x, y }) => x + y
      }).create({x: 1, y: 2})).toEqual(syncAction);
    });

    it("should use an identity payload builder by default", () => {
      const syncAction = {
        type: TYPE,
        payload: {test: 123}
      };

      expect(actions.syncAction({
        type: TYPE
      }).create({test: 123})).toEqual(syncAction)
    });
  });

  describe("asyncAction", () => {
    const TYPE = "ASYNC_ACTION";
    const types = {
      REQUEST: { TYPE: `${TYPE}_REQUEST` },
      SUCCESS: { TYPE: `${TYPE}_SUCCESS` },
      FAILURE: { TYPE: `${TYPE}_FAILURE` }
    };

    it("should create an async action definition", () => {
      const actionDefinition = actions.asyncAction({
        type: TYPE,
        builder: ({ x, y }) => x + y
      });

      expect(actionDefinition.REQUEST).toEqual(types.REQUEST);
      expect(actionDefinition.SUCCESS).toEqual(types.SUCCESS);
      expect(actionDefinition.FAILURE).toEqual(types.FAILURE);
    });

    it("should create an async action", () => {
      const request = () => "fake request";
      const asyncAction = {
        [ASYNC_CALL]: {
          types,
          request
        },
        payload: 3
      };

      expect(actions.asyncAction({
        type: TYPE,
        request: request,
        builder: ({ x, y }) => x + y
      }).create({x: 1, y: 2})).toEqual(asyncAction)
    });

    it("should use an identity payload builder by default", () => {
      const asyncAction = {
        [ASYNC_CALL]: {
          types
        },
        payload: {test: 123}
      };

      expect(actions.asyncAction({
        type: TYPE,
        request: () => Promise.resolve()
      }).create({test: 123})).toEqual(asyncAction);
    });
  });

  describe("contextChangingAction", () => {
    const TYPE = "CONTEXT_CHANGING_ACTION";

    it("should set a meta flag to change the version", () => {
      const contextChangingAction = {
        type: TYPE,
        meta: {changeVersion: true},
        payload: {x: 1}
      };

      expect(actions.contextChangingAction(actions.syncAction)({
        type: TYPE
      }).create({x: 1})).toEqual(contextChangingAction);
    })
  });

});

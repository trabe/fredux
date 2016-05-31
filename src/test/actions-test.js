import expect from "expect";
import { promiseAction, contextChangingAction, startIntervalAction, stopIntervalAction } from "../actions";
import { PROMISE_CALL, SET_INTERVAL, UNSET_INTERVAL } from "../symbols";

describe("actions", () => {
  describe("promiseAction decorator", () => {
    context("an action decorated with 'promiseAction'", () => {
      const call = () => Promise.accept();
      const actionCreator = () => promiseAction(call)({ type: "ACTION" });

      it("should return an action with the promise call in the [PROMISE_CALL] property", () => {
        expect(actionCreator()[PROMISE_CALL]).toEqual(call);
      });
    });
  });

  describe("contextChanging decorator", () => {
    context("an action decorated with 'contextChangingAction'", () => {
      it("should return an action with the change context flag set to true", () => {
        const actionCreator = () => contextChangingAction({ type: "ACTION", payload: {} });

        expect(actionCreator().meta.changeVersion).toBe(true);
      });
    });
  });

  describe("startIntervalAction decorator", () => {
    context("an action decorated with 'startIntervalAction'", () => {
      const actionCreator = () => startIntervalAction({ id: "my_poller", timeout: 2000 })({ type: "ACTION", payload: {} });

      it("should return an action with the id and timeout in the [SET_INTERVAL] property", () => {
        const action = actionCreator();

        expect(action[SET_INTERVAL].id).toEqual("my_poller");
        expect(action[SET_INTERVAL].timeout).toEqual(2000);
      });
    });

    context("an action decorated with 'stopIntervalAction'", () => {
      const actionCreator = () => stopIntervalAction("my_poller")({ type: "ACTION" });

      it("should return an action with the id in the [UNSET_INTERVAL] property", () => {
        const action = actionCreator();

        expect(action[UNSET_INTERVAL]).toEqual("my_poller");
      });
    });
  });
});

import expect from "expect";
import { isFreduxAction } from "../src/utils";

describe("utils", () => {
  describe("#isFreduxAction", () => {

    context("the action is a fredux action", () => {
      const action = { type: "SOME_FREDUX_ACTION", meta: { freduxAction: true } };

      it("returns true", () => {
        expect(isFreduxAction(action)).toBe(true);
      });
    });

    context("the action is not a fredux action", () => {
      const action = { type: "SOME_ACTION" };

      it("returns false", () => {
        expect(isFreduxAction(action)).toBe(false);
      });
    });

  });
});

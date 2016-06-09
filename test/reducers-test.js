import expect from "expect";
import { version } from "../src/reducers";

const actionWichChangeTheVersion = {
  type: "ACTION_FRUS",
  meta: { changeVersion: true }
};

const actionWichDoesntChangeTheVersion = {
  type: "ACTION_FRUS",
};

describe('version reducer', () => {
  it('should return the initial state', () => {
    expect(version(undefined, {})).toEqual(0);
  });

  it('should increase the current state with changeVersion flag active', () => {
    expect(version( 1, actionWichChangeTheVersion)).toEqual(2);
  });

  it('should not increase the current state with changeVersion flag active', () => {
    expect(version( 1, actionWichDoesntChangeTheVersion)).toEqual(1);
  });
});

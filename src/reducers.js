export function version(state = 0, { meta }) {
  return meta !== undefined && meta.changeVersion === true ? state + 1 : state;
}

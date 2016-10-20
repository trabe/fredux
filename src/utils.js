export function isFreduxAction(action) {
  return Boolean(action.meta && action.meta.freduxAction);
}

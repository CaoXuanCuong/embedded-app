const FREE = "free";
const BASIC = "basic";
const ADVANCED = "advanced";

export function isFree(planCode) {
  return planCode === FREE;
}

export function isBasic(planCode) {
  return planCode === BASIC || planCode === ADVANCED;
}

export function isAdvanced(planCode) {
  return planCode === ADVANCED;
}

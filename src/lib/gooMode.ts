export const DISABLE_GOO_ON_WEBKIT = false

export const isWebkit = (): boolean =>
  typeof navigator !== 'undefined' &&
  /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent)

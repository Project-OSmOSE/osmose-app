// Utils functions

export function arrayToObject(array, key) {
   return array.reduce((obj, item) => {
     obj[item[key]] = item
     return obj
   }, {})
}

// Object.values alternative for flow (cf https://github.com/facebook/flow/issues/2221)
export function objectValues(obj) {
    return Object.keys(obj).map(key => obj[key]);
}

export function format(first: string, middle: string, last: string): string {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}

// export function fetchData(url, requestOptions, successCallback, errorCallback) {
//   fetch(url, requestOptions)
//       .then((response) => response.json())
//       .then(successCallback)
//       .catch(errorCallback);
// }

export function debounce(func: any, delay: number) {
  let timer: any;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

export function objString(input: any) {
  const json = JSON.stringify(input, null, 2);
  return json.replace(/"([^" ]+)":/g, "$1:");
}

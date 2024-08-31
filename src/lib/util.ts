export function debounce(func, delay) {
  let timer: any;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

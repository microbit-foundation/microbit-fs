export const fib: (n: number) => number = (n) =>
  n < 2 ? n : fib(n - 1) + fib(n - 2);

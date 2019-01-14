import { fib } from '../fib';

describe(`fib`, () => {
  it(`should have correct base case`, () => {
    expect(fib(0)).toEqual(0);
    expect(fib(1)).toEqual(1);
  });
  it(`should calculate nth term`, () => {
    expect(fib(2)).toEqual(1);
    expect(fib(3)).toEqual(2);

    expect(fib(7)).toEqual(13);
  });
});

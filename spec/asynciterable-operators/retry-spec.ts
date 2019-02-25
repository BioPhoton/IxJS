import { concat, range, sequenceEqual, throwError } from 'ix/asynciterable';
import { retry } from 'ix/asynciterable/operators';
import { hasNext } from '../asynciterablehelpers';

test('AsyncIterable#retry infinite no errors does not retry', async () => {
  const xs = range(0, 10);

  const res = xs.pipe(retry());
  expect(await sequenceEqual(res, xs)).toBeTruthy();
});

test('AsyncIterable#retry finite no errors does not retry', async () => {
  const xs = range(0, 10);

  const res = xs.pipe(retry(2));
  expect(await sequenceEqual(res, xs)).toBeTruthy();
});

test('AsyncIterable#retry finite eventually gives up', async () => {
  const err = new Error();
  const xs = concat(range(0, 2), throwError(err));

  const res = xs.pipe(retry(2));
  const it = res[Symbol.asyncIterator]();
  await hasNext(it, 0);
  await hasNext(it, 1);
  await hasNext(it, 0);
  await hasNext(it, 1);
  try {
    await it.next();
  } catch (e) {
    expect(err).toEqual(e);
  }
});

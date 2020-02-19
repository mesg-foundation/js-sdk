import { Test } from 'tape'
import test from 'tape'
import Instance from './instance';

const instanceAPI = new Instance()
const hash = "E6Hh1tKL3pi1bi7iL3FH6y1Um1vHfCoo8qZfGVFfm9pp"

test('instance list', async function (t: Test) {
  t.plan(1)
  const instances = await instanceAPI.list()
  t.equal(instances.length, 1)
});

test('instance get', async function (t: Test) {
  t.plan(1)
  const instance = await instanceAPI.get(hash)
  console.log(instance)
  t.equal(instance.hash, hash)
});

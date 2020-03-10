import { Test } from 'tape'
import test from 'tape'
import Vault from '.';
import Memory from './store/memory';
import File from './store/file';
import { Store } from './type';

const password = 'password'
const key = 'test'
const value = { foo: 'bar' }

const tests = (t: Test, store: Store) => {
  const vault = new Vault(store)
  t.test('write to vault', (tt: Test) => {
    tt.plan(1)
    vault.set(key, value, password)
    tt.pass()
  })

  t.test('read from vault', (tt: Test) => {
    tt.plan(3)
    const res = vault.get(key, password)
    tt.pass()
    tt.equal(typeof res, 'object')
    tt.equal(res.foo, value.foo)
  })

  t.test('get all keys', (tt: Test) => {
    tt.plan(2)
    const res = vault.keys()
    tt.pass()
    tt.deepEqual(res, [key])
  })
}

test('create vault memory', async (t: Test) => {
  tests(t, new Memory())
});

test('create vault file', async (t: Test) => {
  const path = __dirname + '/test.json'
  tests(t, new File(path))
});
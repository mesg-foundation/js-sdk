import { Test } from 'tape'
import test from 'tape'
import Vault from '.';
import Memory from './store/memory';
import File from './store/file';

const password = 'password'
const key = 'test'
const value = { foo: 'bar' }

test('create memory vault', async (t: Test) => {
  const vault = new Vault(new Memory())
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
});

test('create file vault', async (t: Test) => {
  const path = __dirname + '/test.json'
  const vault = new Vault(new File(path))
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
});

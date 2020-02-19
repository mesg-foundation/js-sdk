import { Test } from 'tape'
import test from 'tape'
import Service from './service';
import Account from './account';
import Transaction from './transaction';

const lcdEndpoint = 'http://localhost:1317'
const serviceAPI = new Service(lcdEndpoint)
const accountAPI = new Account(lcdEndpoint)
const address = "mesgtest19k9xsdy42f4a7f7777wj4rs5eh9622h2z7mzdh"
const mnemonic = "afford problem shove post clump space govern reward fringe input owner knock toddler orange castle course pepper fox youth field ritual wife weapon desert"
const service = {
  name: 'test',
  sid: 'test',
  source: 'test',
  configuration: {}
}
const hash = "Dodtu7zTjLNmwbyauavch6gZZrzVaWUh6APBzo1mhS2i"

test('service hash', async function (t: Test) {
  t.plan(1)
  const h = await serviceAPI.hash(service)

  t.equal(h, hash)
});

test('service create', async function (t: Test) {
  t.plan(3)

  const account = await accountAPI.get(address)
  const tx = new Transaction({
    account_number: account.account_number.toString(),
    sequence: account.sequence.toString(),
    chain_id: 'mesg-dev-chain',
    fee: {
      amount: [{ denom: 'atto', amount: '60168' }],
      gas: '60168'
    },
    memo: '',
    msgs: [
      serviceAPI.createMsg(account.address, service)
    ]
  })
  const res = await tx
    .addSignatureFromMnemonic(mnemonic)
    .broadcast(lcdEndpoint, 'block')
  t.assert(res.height > 0)
  t.assert(res.txhash !== '')
  t.assert(!res.code)
});

test('service list', async function (t: Test) {
  t.plan(1)
  const services = await serviceAPI.list()
  t.equal(services.length, 1)
});

test('service get', async function (t: Test) {
  t.plan(1)
  const service = await serviceAPI.get(hash)
  t.equal(service.hash, hash)
});

test('service exists', async function (t: Test) {
  t.plan(2)
  const exists = await serviceAPI.exists(hash)
  const notExists = await serviceAPI.exists("Dodtu7zTjLNmwbyauavch6gZZrzVaWUh6Aaaaaaaaaaa")
  t.equal(exists, true)
  t.equal(notExists, false)
});

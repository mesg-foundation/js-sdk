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
let hash = "Dodtu7zTjLNmwbyauavch6gZZrzVaWUh6APBzo1mhS2i"

test('service hash', async function (t: Test) {
  t.plan(1)
  const h = await serviceAPI.hash({
    name: 'test',
    sid: 'test',
    source: 'test',
    tasks: [],
    events: []
  })

  t.equal(h, hash)
});

test('service create', async function (t: Test) {
  t.plan(1)

  const account = await accountAPI.get(address)
  const service = { name: 'test', sid: 'test', source: 'test' }
  const tx = new Transaction({
    account_number: account.account_number.toString(),
    sequence: account.sequence.toString(),
    chain_id: 'mesg-dev-chain',
    fee: {
      amount: [{ denom: 'atto', amount: '52399' }],
      gas: '52399'
    },
    memo: '',
    msgs: [
      serviceAPI.createMsg(account.address, service)
      // {
      //   type: 'cosmos-sdk/MsgSend',
      //   value: {
      //     amount: [
      //       {
      //         amount: "1000000000000000000".toString(),
      //         denom: 'atto'
      //       }
      //     ],
      //     from_address: account.address,
      //     to_address: "mesgtest1yztk7h0la9e2wdhed3h37sd50szq8hsvrvgump"
      //   }
      // }
    ]
  })
  const res = await tx
    .addSignatureFromMnemonic(mnemonic)
    .broadcast(lcdEndpoint, 'sync')
  console.log(res)
});

test('service list', async function (t: Test) {
  t.plan(1)
  const services = await serviceAPI.list()
  t.equal(services.length, 1)
});

test('service get', async function (t: Test) {
  t.plan(1)
  const service = await serviceAPI.get("Bizw1aCYPa5QvC7nJxGTQFaTvfZdAS2hh1BuEZXSdcQe")
  t.equal(service.hash, "Bizw1aCYPa5QvC7nJxGTQFaTvfZdAS2hh1BuEZXSdcQe")
});

test('service exists', async function (t: Test) {
  t.plan(2)
  const exists = await serviceAPI.exists("Bizw1aCYPa5QvC7nJxGTQFaTvfZdAS2hh1BuEZXSdcQe")
  const notExists = await serviceAPI.exists("Bizw1aCYPa5QvC7nJxGTQFaTvfZdAS2hh1BuEZXfffff")
  t.equal(exists, true)
  t.equal(notExists, false)
});

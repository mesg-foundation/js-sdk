import { Test } from 'tape'
import test from 'tape'
import Transaction from './transaction';
import API from '.';
import { Resource } from './ownership';
import * as b58 from './util/base58';
import { encode } from './util/encoder';

const lcdEndpoint = "http://localhost:1317"
const api = new API('localhost:50052')
const address = "mesgtest19k9xsdy42f4a7f7777wj4rs5eh9622h2z7mzdh"
const mnemonic = "afford problem shove post clump space govern reward fringe input owner knock toddler orange castle course pepper fox youth field ritual wife weapon desert"
const chain_id = 'mesg-dev-chain'
const service = {
  sid: "js-function",
  name: "js-function",
  configuration: {},
  tasks: [{
    key: "execute",
    inputs: [
      { key: "code", type: "String" },
      { key: "inputs", type: "Any" }
    ],
    outputs: [
      { key: "result", type: "Any" }
    ]
  }],
  source: "QmV9uGGMPcaF22TjBJEcko6VxjJpK3wdtaypHEbh6j4Pz9"
}
const serviceHash = "8K1X1rfEL1WCwpm2zBwsWH3bijyNuYWTN3LKoBP4Bkfy"
const runnerHash = "5aTCivi9sjtpwSxeFAMLD2rgTUHt3EC2etX383dgaPC4"
const instanceHash = "4zw8Mz2rUURbp33zRz8F7HcvFVoxtpLnmdpDpinNcRzw"
const eventHash = "6aUPZhmnFKiSsHXRaddbnqsKKi9KogbQNiKUcpivaohb"
const executionHash = "ErrDsCUCRTucQeynBqxabyMTCkiBicRzuMKqaArhomyN"

test('service', async (tt: Test) => {
  tt.test('service hash', async (t: Test) => {
    t.plan(1)
    const h = await api.service.hash(service)

    t.equal(h, serviceHash)
  });

  tt.test('service create', async (t: Test) => {
    t.plan(3)

    const account = await api.account.get(address)
    const tx = new Transaction({
      account_number: account.account_number.toString(),
      sequence: account.sequence.toString(),
      chain_id,
      memo: '',
      fee: {
        amount: [{ denom: 'atto', amount: '64738' }],
        gas: '64738'
      },
      msgs: [
        api.service.createMsg(account.address, service)
      ]
    })
    const res = await tx
      .addSignatureFromMnemonic(mnemonic)
      .broadcast(lcdEndpoint, 'block')
    t.assert(res.height > 0)
    t.assert(res.txhash !== '')
    t.assert(!res.code)
  });

  tt.test('service list', async (t: Test) => {
    t.plan(1)
    const services = await api.service.list()
    t.equal(services.length, 1)
  });

  tt.test('service get', async (t: Test) => {
    t.plan(1)
    const service = await api.service.get(serviceHash)
    t.equal(service.hash, serviceHash)
  });

  tt.test('service exists', async (t: Test) => {
    t.plan(2)
    const exists = await api.service.exists(serviceHash)
    const notExists = await api.service.exists("Dodtu7zTjLNmwbyauavch6gZZrzVaWUh6Aaaaaaaaaaa")
    t.equal(exists, true)
    t.equal(notExists, false)
  });
})

test('ownership', async (tt: Test) => {
  tt.test('ownership list', async (t: Test) => {
    t.plan(4)
    const ownerships = await api.ownership.list()
    t.assert(ownerships.length === 1)
    t.assert(ownerships[0].owner === address)
    t.assert(ownerships[0].resourceHash === serviceHash)
    t.assert(ownerships[0].resource === Resource.Service)
  })
})

test('runner', async (tt: Test) => {
  tt.test('runner create', async (t: Test) => {
    t.plan(2)
    const account = await api.account.get(address)
    const tx = new Transaction({
      account_number: account.account_number.toString(),
      sequence: account.sequence.toString(),
      chain_id,
      memo: '',
      fee: {
        amount: [{ denom: 'atto', amount: '200000' }],
        gas: '200000'
      },
      msgs: [
        api.runner.createMsg(account.address, serviceHash)
      ]
    })
    const res = await tx
      .addSignatureFromMnemonic(mnemonic)
      .broadcast(lcdEndpoint, 'block')
    t.assert(res.height > 0)
    t.assert(!res.code)
  })

  tt.test('runner list', async (t: Test) => {
    t.plan(3)
    const runners = await api.runner.list()
    t.assert(runners.length === 1)
    t.assert(runners[0].hash === runnerHash)
    t.assert(runners[0].instanceHash === instanceHash)
  })

  tt.test('runner get', async (t: Test) => {
    t.plan(2)
    const runner = await api.runner.get(runnerHash)
    t.assert(runner.hash === runnerHash)
    t.assert(runner.instanceHash === instanceHash)
  })

  tt.test('runner delete', async (t: Test) => {
    t.plan(2)
    const account = await api.account.get(address)
    const tx = new Transaction({
      account_number: account.account_number.toString(),
      sequence: account.sequence.toString(),
      chain_id,
      memo: '',
      fee: {
        amount: [{ denom: 'atto', amount: '200000' }],
        gas: '200000'
      },
      msgs: [
        api.runner.deleteMsg(account.address, runnerHash)
      ]
    })
    const res = await tx
      .addSignatureFromMnemonic(mnemonic)
      .broadcast(lcdEndpoint, 'block')
    t.assert(res.height > 0)
    t.assert(!res.code)
  })

  tt.test('runner create (to keep for the rest of the test)', async (t: Test) => {
    t.plan(2)
    const account = await api.account.get(address)
    const tx = new Transaction({
      account_number: account.account_number.toString(),
      sequence: account.sequence.toString(),
      chain_id,
      memo: '',
      fee: {
        amount: [{ denom: 'atto', amount: '200000' }],
        gas: '200000'
      },
      msgs: [
        api.runner.createMsg(account.address, serviceHash)
      ]
    })
    const res = await tx
      .addSignatureFromMnemonic(mnemonic)
      .broadcast(lcdEndpoint, 'block')
    t.assert(res.height > 0)
    t.assert(!res.code)
  })
})

test('instance', async (tt: Test) => {
  tt.test('instance list', async (t: Test) => {
    t.plan(3)
    const instances = await api.instance.list()
    t.assert(instances.length === 1)
    t.assert(instances[0].hash === instanceHash)
    t.assert(instances[0].serviceHash === serviceHash)
  })

  tt.test('instance get', async (t: Test) => {
    t.plan(2)
    const instance = await api.instance.get(instanceHash)
    t.assert(instance.hash === instanceHash)
    t.assert(instance.serviceHash === serviceHash)
  })
})

test('execution', async (tt: Test) => {

  tt.test('execution create', async (t: Test) => {
    t.plan(1)
    const execution = await api.execution.create({
      eventHash: b58.decode(eventHash),
      executorHash: b58.decode(runnerHash),
      inputs: encode({
        code: 'module.export = inputs => inputs * 2',
        inputs: 21
      }),
      taskKey: 'execute'
    })
    t.assert(b58.encode(execution.hash) === executionHash)
  })

  // tt.test('execution create', async (t: Test) => {
  //   t.plan(1)

  //   const account = await api.account.get(address)
  //   const tx = new Transaction({
  //     account_number: account.account_number.toString(),
  //     sequence: account.sequence.toString(),
  //     chain_id,
  //     memo: '',
  //     fee: {
  //       amount: [{ denom: 'atto', amount: '200000' }],
  //       gas: '200000'
  //     },
  //     msgs: [
  //       api.execution.createMsg(
  //         address,
  //         runnerHash,
  //         "execute",
  //         { code: "module.export = inputs => inputs * 2", inputs: 21 },
  //         null,
  //         eventHash,
  //         null,
  //         null,
  //         []
  //       )
  //     ]
  //   })
  //   const res = await tx
  //     .addSignatureFromMnemonic(mnemonic)
  //     .broadcast(lcdEndpoint, 'block')
  //   t.assert(res.height > 0)
  // })

  // tt.test('execution update', async (t: Test) => {
  //   t.plan(1)
  //   await api.execution.update({
  //     hash: b58.decode(executionHash),
  //     outputs: encode({
  //       result: 42
  //     })
  //   })
  //   t.pass()
  // })

  tt.test('execution list', async (t: Test) => {
    t.plan(2)
    const executions = await api.execution.list()
    t.assert(executions.length === 1)
    t.assert(executions[0].hash === executionHash)
  });

    tt.test('execution get', async (t: Test) => {
      t.plan(5)
      const execution = await api.execution.get(executionHash)
      t.assert(execution.hash === executionHash)
      t.assert(execution.executorHash === runnerHash)
      t.assert(execution.instanceHash === instanceHash)
      t.assert(execution.eventHash === eventHash)
      t.assert(execution.taskKey === 'execute')
    });
  })

  test('process', async (tt: Test) => {
    tt.test('process create', async (t: Test) => {
      t.plan(3)

      const account = await api.account.get(address)
      const tx = new Transaction({
        account_number: account.account_number.toString(),
        sequence: account.sequence.toString(),
        chain_id,
        memo: '',
        fee: {
          amount: [{ denom: 'atto', amount: '64738' }],
          gas: '64738'
        },
        msgs: [
          api.process.createMsg(account.address, {
            name: 'test',
            nodes: [{
              key: 'trigger',
              result: {
                instanceHash,
                taskKey: 'execute'
              }
            }, {
              key: 'task',
              task: {
                instanceHash,
                taskKey: 'execute'
              }
            }],
            edges: [{
              src: 'trigger',
              dst: 'task'
            }]
          })
        ]
      })
      const res = await tx
        .addSignatureFromMnemonic(mnemonic)
        .broadcast(lcdEndpoint, 'block')
      t.assert(res.height > 0)
      t.assert(res.txhash !== '')
      t.assert(!res.code)
    })
  })
import { Test } from 'tape'
import test from 'tape'
import { readFileSync } from 'fs';
import compile from './process'

test('valid compilation', async (t: Test) => {
  t.plan(32)
  const env = { INSTANCE_HASH: 'xxx' }
  const res = await compile(
    readFileSync('src/tests/process.yml'),
    async ({ instanceHash }) => Buffer.from(instanceHash),
    env
  )
  // Test structure
  t.equal(res.name, "test")
  t.equal(res.nodes.length, 4)
  t.equal(res.edges.length, 3)

  // Test nodes
  const [trigger, filter, map, task] = res.nodes
  t.ok(trigger.event)
  t.ok(filter.filter)
  t.ok(map.map)
  t.ok(task.task)

  // Test trigger
  t.equal(trigger.key, "eventTrigger")
  t.equal(trigger.event.eventKey, "eventX")
  t.isEquivalent(trigger.event.instanceHash, Buffer.from(env.INSTANCE_HASH))
  
  // Test filter
  t.equal(filter.key, "node-1")
  t.equal(filter.filter.conditions.length, 2)
  t.equal(filter.filter.conditions[0].key, "foo")
  t.equal(filter.filter.conditions[0].predicate, 1)
  t.equal(filter.filter.conditions[0].value, "bar")
  t.equal(filter.filter.conditions[1].key, "hello")
  t.equal(filter.filter.conditions[1].predicate, 1)
  t.equal(filter.filter.conditions[1].value, "world")

  // Test map
  t.equal(map.key, "node-2-inputs")
  t.equal(Object.keys(map.map.outputs).length, 7)
  // Test constants
  t.equal(map.map.outputs["constant_str"].stringConst, "constant_str")
  t.equal(map.map.outputs["constant_null"].null, 0)
  t.equal(map.map.outputs["constant_number"].doubleConst, 42)
  t.equal(map.map.outputs["constant_bool"].boolConst, true)
  // Test list
  const list = map.map.outputs["constant_list"].list.outputs
  t.equal(list.length, 5)
  t.equal(list[0].stringConst, "string")
  t.equal(list[1].null, 0)
  t.equal(list[2].doubleConst, 42)
  t.equal(list[3].map.outputs["foo"].stringConst, "bar")
  t.equal(list[3].map.outputs["number"].doubleConst, 42)
  t.equal(list[4].ref.key, "dataX")
  t.equal(list[4].ref.nodeKey, "eventTrigger")
  // Test map
});

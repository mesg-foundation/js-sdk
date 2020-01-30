import { Test } from 'tape'
import test from 'tape'
import { readFileSync } from 'fs';
import compile from './process'

test('valid compilation', async (t: Test) => {
  t.plan(114)
  const env = { INSTANCE_HASH: 'xxx' }
  const res = await compile(
    readFileSync('src/tests/process.yml'),
    async ({ instanceHash }) => Buffer.from(instanceHash),
    env
  )
  // Test structure
  t.equal(res.name, "test")
  t.equal(res.nodes.length, 8)
  t.equal(res.edges.length, 7)

  // Test nodes
  const [trigger, filter, mapTask1, task1, mapTask2, task2, mapTask3, task3] = res.nodes
  t.ok(trigger.event)
  t.ok(filter.filter)
  t.ok(mapTask1.map)
  t.ok(task1.task)
  t.ok(mapTask2.map)
  t.ok(task2.task)
  t.ok(mapTask3.map)
  t.ok(task3.task)

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
  t.equal(mapTask1.key, "task1-inputs")
  t.equal(Object.keys(mapTask1.map.outputs).length, 13)
  // Test constants
  t.equal(mapTask1.map.outputs["constant_str"].stringConst, "constant_str")
  t.equal(mapTask1.map.outputs["constant_null"].null, 0)
  t.equal(mapTask1.map.outputs["constant_number"].doubleConst, 42)
  t.equal(mapTask1.map.outputs["constant_bool"].boolConst, true)
  // Test list
  const list = mapTask1.map.outputs["constant_list"].list.outputs
  t.equal(list.length, 5)
  t.equal(list[0].stringConst, "string")
  t.equal(list[1].null, 0)
  t.equal(list[2].doubleConst, 42)
  t.equal(list[3].map.outputs["foo"].stringConst, "bar")
  t.equal(list[3].map.outputs["number"].doubleConst, 42)
  t.equal(list[4].ref.path.key, "dataX")
  t.equal(list[4].ref.nodeKey, "node-1")
  // Test map
  const inputMap = mapTask1.map.outputs["constant_map"].map.outputs
  t.equal(Object.keys(inputMap).length, 7)
  t.equal(inputMap["constant_str"].stringConst, "constant_str")
  t.equal(inputMap["constant_null"].null, 0)
  t.equal(inputMap["constant_number"].doubleConst, 42)
  t.equal(inputMap["constant_number"].doubleConst, 42)
  t.equal(inputMap["constant_list"].list.outputs.length, 5)
  t.equal(inputMap["constant_list"].list.outputs[0].stringConst, "string")
  t.equal(inputMap["constant_list"].list.outputs[1].null, 0)
  t.equal(inputMap["constant_list"].list.outputs[2].doubleConst, 42)
  t.equal(inputMap["constant_list"].list.outputs[3].map.outputs["foo"].stringConst, "bar")
  t.equal(inputMap["constant_list"].list.outputs[4].ref.path.key, "dataX")
  t.equal(inputMap["constant_list"].list.outputs[4].ref.nodeKey, "node-1")
  t.equal(inputMap["constant_map"].map.outputs["constant_str"].stringConst, "constant_str")
  t.equal(inputMap["constant_map"].map.outputs["constant_null"].null, 0)
  t.equal(inputMap["constant_map"].map.outputs["constant_number"].doubleConst, 42)
  t.equal(inputMap["constant_map"].map.outputs["constant_bool"].boolConst, true)
  t.equal(inputMap["constant_map"].map.outputs["constant_list"].list.outputs[0].stringConst, "string")
  t.equal(inputMap["constant_map"].map.outputs["constant_list"].list.outputs[1].null, 0)
  t.equal(inputMap["constant_map"].map.outputs["constant_list"].list.outputs[2].doubleConst, 42)
  t.equal(inputMap["constant_map"].map.outputs["constant_list"].list.outputs[3].map.outputs["foo"].stringConst, "bar")
  t.equal(inputMap["constant_map"].map.outputs["constant_list"].list.outputs[4].ref.path.key, "dataX")
  t.equal(inputMap["constant_map"].map.outputs["constant_list"].list.outputs[4].ref.nodeKey, "node-1")
  t.equal(inputMap["constant_map"].map.outputs["ref"].ref.path.key, "dataX")
  t.equal(inputMap["constant_map"].map.outputs["ref"].ref.nodeKey, "eventTrigger")
  // Test ref
  const ref = mapTask1.map.outputs["ref"].ref
  t.equal(ref.path.key, "dataX")
  t.equal(ref.nodeKey, "eventTrigger")
  // Test ref nested
  const ref_nested = mapTask1.map.outputs["ref_nested"].ref
  t.equal(ref.nodeKey, "eventTrigger")
  t.equal(ref_nested.path.key, "dataX")
  t.equal(ref_nested.path.index, null)
  t.equal(ref_nested.path.path.key, "foo")
  t.equal(ref_nested.path.path.path, null)
  t.equal(ref_nested.path.path.index, null)
  // Test ref list
  const ref_list = mapTask1.map.outputs["ref_list"].ref
  t.equal(ref.nodeKey, "eventTrigger")
  t.equal(ref_list.path.key, "dataY")
  t.equal(ref_list.path.index, null)
  t.equal(ref_list.path.path.key, null)
  t.equal(ref_list.path.path.path, null)
  t.equal(ref_list.path.path.index, 0)
  // Test ref nested_list
  const ref_nested_list = mapTask1.map.outputs["ref_nested_list"].ref
  t.equal(ref.nodeKey, "eventTrigger")
  t.equal(ref_nested_list.path.key, "dataX")
  t.equal(ref_nested_list.path.index, null)
  t.equal(ref_nested_list.path.path.key, "bar")
  t.equal(ref_nested_list.path.path.index, null)
  t.equal(ref_nested_list.path.path.path.key, null)
  t.equal(ref_nested_list.path.path.path.path, null)
  t.equal(ref_nested_list.path.path.path.index, 0)
  // Test ref list nested
  const ref_list_nested = mapTask1.map.outputs["ref_list_nested"].ref
  t.equal(ref.nodeKey, "eventTrigger")
  t.equal(ref_list_nested.path.key, "dataY")
  t.equal(ref_list_nested.path.index, null)
  t.equal(ref_list_nested.path.path.key, null)
  t.equal(ref_list_nested.path.path.index, 0)
  t.equal(ref_list_nested.path.path.path.key, "bar")
  t.equal(ref_list_nested.path.path.path.path, null)
  t.equal(ref_list_nested.path.path.path.index, null)
  // Test ref list nested
  const ref_list_list = mapTask1.map.outputs["ref_list_list"].ref
  t.equal(ref.nodeKey, "eventTrigger")
  t.equal(ref_list_list.path.key, "dataY")
  t.equal(ref_list_list.path.index, null)
  t.equal(ref_list_list.path.path.key, null)
  t.equal(ref_list_list.path.path.index, 0)
  t.equal(ref_list_list.path.path.path.key, null)
  t.equal(ref_list_list.path.path.path.path, null)
  t.equal(ref_list_list.path.path.path.index, 1)
  // Test implicit ref
  const implicit_ref = mapTask1.map.outputs["implicit_ref"].ref
  t.equal(implicit_ref.nodeKey, "node-1")
  t.equal(implicit_ref.path.key, "dataX")

  // Test task1
  t.isEquivalent(task1.task.instanceHash, Buffer.from(env.INSTANCE_HASH))
  t.equal(task1.task.taskKey, "taskX")

  // Test map task2
  t.equal(Object.keys(mapTask2.map.outputs).length, 0)

  // Test task2
  t.isEquivalent(task2.task.instanceHash, Buffer.from(env.INSTANCE_HASH))
  t.equal(task2.task.taskKey, "taskY")

  // Test map task3
  t.equal(Object.keys(mapTask3.map.outputs).length, 3)
  t.equal(mapTask3.map.outputs["a"].ref.nodeKey, "task1")
  t.equal(mapTask3.map.outputs["a"].ref.path.key, "resultA")
  t.equal(mapTask3.map.outputs["b"].ref.nodeKey, "task2")
  t.equal(mapTask3.map.outputs["b"].ref.path.key, "resultB")
  t.equal(mapTask3.map.outputs["c"].ref.nodeKey, "task2")
  t.equal(mapTask3.map.outputs["c"].ref.path.key, "resultC")

  // Test task3
  t.isEquivalent(task3.task.instanceHash, Buffer.from(env.INSTANCE_HASH))
  t.equal(task3.task.taskKey, "taskZ")
});

import { Test } from 'tape'
import test from 'tape'
import { readFileSync } from 'fs';
import compile from './process'
import { IOutputStringType, IOutputNullType, IOutputDoubleType, IOutputBoolType, IOutputListType, IOutputMapType, IReference, IRefSelectorKey, IRefSelectorIndex, IFilterValueStringType } from '@mesg/api/lib/process';

test('valid compilation', async (t: Test) => {
  t.plan(101)
  const env = { INSTANCE_HASH: 'xxx' }
  const res = await compile(
    readFileSync('src/tests/process.yml'),
    async ({ instanceHash }) => instanceHash,
    env
  )
  // Test structure
  t.equal(res.name, "test")
  t.equal(res.nodes.length, 8)
  t.equal(res.edges.length, 7)

  // Test nodes
  const [trigger, filter, mapTask1, task1, mapTask2, task2, mapTask3, task3] = res.nodes
  if (trigger.Type.type !== 'mesg.types.Process_Node_Event_') return t.fail("wrong type")
  if (filter.Type.type !== 'mesg.types.Process_Node_Filter_') return t.fail("wrong type")
  if (mapTask1.Type.type !== 'mesg.types.Process_Node_Map_') return t.fail("wrong type")
  if (task1.Type.type !== 'mesg.types.Process_Node_Task_') return t.fail("wrong type")
  if (mapTask2.Type.type !== 'mesg.types.Process_Node_Map_') return t.fail("wrong type")
  if (task2.Type.type !== 'mesg.types.Process_Node_Task_') return t.fail("wrong type")
  if (mapTask3.Type.type !== 'mesg.types.Process_Node_Map_') return t.fail("wrong type")
  if (task3.Type.type !== 'mesg.types.Process_Node_Task_') return t.fail("wrong type")

  t.ok(trigger.Type.value.event)
  t.ok(filter.Type.value.filter)
  t.ok(mapTask1.Type.value.map)
  t.ok(task1.Type.value.task)
  t.ok(mapTask2.Type.value.map)
  t.ok(task2.Type.value.task)
  t.ok(mapTask3.Type.value.map)
  t.ok(task3.Type.value.task)

  // Test trigger
  t.equal(trigger.key, "eventTrigger")
  t.equal(trigger.Type.value.event.eventKey, "eventX")
  t.isEquivalent(trigger.Type.value.event.instanceHash, env.INSTANCE_HASH)

  // Test filter
  t.equal(filter.key, "node-1")
  t.equal(filter.Type.value.filter.conditions.length, 2)
  t.equal((filter.Type.value.filter.conditions[0].ref.path.Selector as IRefSelectorKey).value.key, "foo")
  t.equal(filter.Type.value.filter.conditions[0].predicate, 1)
  t.equal((filter.Type.value.filter.conditions[0].value.Kind as IFilterValueStringType).value.string_value, "bar")
  t.equal((filter.Type.value.filter.conditions[1].ref.path.Selector as IRefSelectorKey).value.key, "hello")
  t.equal(filter.Type.value.filter.conditions[1].predicate, 1)
  t.equal((filter.Type.value.filter.conditions[1].value.Kind as IFilterValueStringType).value.string_value, "world")

  // Test map
  t.equal(mapTask1.key, "task1-inputs")
  t.equal(Object.keys(mapTask1.Type.value.map).length, 13)
  // Test constants
  t.equal((mapTask1.Type.value.map.find(x => x.Key === "constant_str").Value.Value as IOutputStringType).value.string_const, "constant_str")
  t.equal((mapTask1.Type.value.map.find(x => x.Key === "constant_null").Value.Value as IOutputNullType).value.null, undefined)
  t.equal((mapTask1.Type.value.map.find(x => x.Key === "constant_number").Value.Value as IOutputDoubleType).value.double_const, 42)
  t.equal((mapTask1.Type.value.map.find(x => x.Key === "constant_bool").Value.Value as IOutputBoolType).value.bool_const, true)
  // Test list
  const list = (mapTask1.Type.value.map.find(x => x.Key === "constant_list").Value.Value as IOutputListType).value.list.outputs
  t.equal(list.length, 5)
  t.equal((list[0].Value as IOutputStringType).value.string_const, "string")
  t.equal((list[1].Value as IOutputNullType).value.null, undefined)
  t.equal((list[2].Value as IOutputDoubleType).value.double_const, 42)
  t.equal(((list[3].Value as IOutputMapType).value.map.find(x => x.Key === "foo").Value.Value as IOutputStringType).value.string_const, "bar")
  t.equal(((list[3].Value as IOutputMapType).value.map.find(x => x.Key === "number").Value.Value as IOutputDoubleType).value.double_const, 42)
  t.equal(((list[4].Value as IReference).value.ref.path.Selector as IRefSelectorKey).value.key, "dataX")
  t.equal((list[4].Value as IReference).value.ref.nodeKey, "node-1")
  // Test map
  const inputMap = (mapTask1.Type.value.map.find(x => x.Key === "constant_map").Value.Value as IOutputMapType).value.map
  t.equal(Object.keys(inputMap).length, 7)
  t.equal((inputMap.find(x => x.Key === "constant_str").Value.Value as IOutputStringType).value.string_const, "constant_str")
  t.equal((inputMap.find(x => x.Key === "constant_null").Value.Value as IOutputNullType).value.null, undefined)
  t.equal((inputMap.find(x => x.Key === "constant_number").Value.Value as IOutputDoubleType).value.double_const, 42)
  t.equal((inputMap.find(x => x.Key === "constant_number").Value.Value as IOutputDoubleType).value.double_const, 42)
  t.equal((inputMap.find(x => x.Key === "constant_list").Value.Value as IOutputListType).value.list.outputs.length, 5)
  t.equal(((inputMap.find(x => x.Key === "constant_list").Value.Value as IOutputListType).value.list.outputs[0].Value as IOutputStringType).value.string_const, "string")
  t.equal(((inputMap.find(x => x.Key === "constant_list").Value.Value as IOutputListType).value.list.outputs[1].Value as IOutputNullType).value.null, undefined)
  t.equal(((inputMap.find(x => x.Key === "constant_list").Value.Value as IOutputListType).value.list.outputs[2].Value as IOutputDoubleType).value.double_const, 42)
  t.equal((((inputMap.find(x => x.Key === "constant_list").Value.Value as IOutputListType).value.list.outputs[3].Value as IOutputMapType).value.map.find(x => x.Key === "foo").Value.Value as IOutputStringType).value.string_const, "bar")
  t.equal((((inputMap.find(x => x.Key === "constant_list").Value.Value as IOutputListType).value.list.outputs[4].Value as IReference).value.ref.path.Selector as IRefSelectorKey).value.key, "dataX")
  t.equal(((inputMap.find(x => x.Key === "constant_list").Value.Value as IOutputListType).value.list.outputs[4].Value as IReference).value.ref.nodeKey, "node-1")
  t.equal(((inputMap.find(x => x.Key === "constant_map").Value.Value as IOutputMapType).value.map.find(x => x.Key === "constant_str").Value.Value as IOutputStringType).value.string_const, "constant_str")
  t.equal(((inputMap.find(x => x.Key === "constant_map").Value.Value as IOutputMapType).value.map.find(x => x.Key === "constant_null").Value.Value as IOutputNullType).value.null, undefined)
  t.equal(((inputMap.find(x => x.Key === "constant_map").Value.Value as IOutputMapType).value.map.find(x => x.Key === "constant_number").Value.Value as IOutputDoubleType).value.double_const, 42)
  t.equal(((inputMap.find(x => x.Key === "constant_map").Value.Value as IOutputMapType).value.map.find(x => x.Key === "constant_bool").Value.Value as IOutputBoolType).value.bool_const, true)
  t.equal((((inputMap.find(x => x.Key === "constant_map").Value.Value as IOutputMapType).value.map.find(x => x.Key === "constant_list").Value.Value as IOutputListType).value.list.outputs[0].Value as IOutputStringType).value.string_const, "string")
  t.equal((((inputMap.find(x => x.Key === "constant_map").Value.Value as IOutputMapType).value.map.find(x => x.Key === "constant_list").Value.Value as IOutputListType).value.list.outputs[1].Value as IOutputNullType).value.null, undefined)
  t.equal((((inputMap.find(x => x.Key === "constant_map").Value.Value as IOutputMapType).value.map.find(x => x.Key === "constant_list").Value.Value as IOutputListType).value.list.outputs[2].Value as IOutputDoubleType).value.double_const, 42)
  t.equal(((((inputMap.find(x => x.Key === "constant_map").Value.Value as IOutputMapType).value.map.find(x => x.Key === "constant_list").Value.Value as IOutputListType).value.list.outputs[3].Value as IOutputMapType).value.map.find(x => x.Key === "foo").Value.Value as IOutputStringType).value.string_const, "bar")
  t.equal(((((inputMap.find(x => x.Key === "constant_map").Value.Value as IOutputMapType).value.map.find(x => x.Key === "constant_list").Value.Value as IOutputListType).value.list.outputs[4].Value as IReference).value.ref.path.Selector as IRefSelectorKey).value.key, "dataX")
  t.equal((((inputMap.find(x => x.Key === "constant_map").Value.Value as IOutputMapType).value.map.find(x => x.Key === "constant_list").Value.Value as IOutputListType).value.list.outputs[4].Value as IReference).value.ref.nodeKey, "node-1")
  t.equal((((inputMap.find(x => x.Key === "constant_map").Value.Value as IOutputMapType).value.map.find(x => x.Key === "ref").Value.Value as IReference).value.ref.path.Selector as IRefSelectorKey).value.key, "dataX")
  t.equal(((inputMap.find(x => x.Key === "constant_map").Value.Value as IOutputMapType).value.map.find(x => x.Key === "ref").Value.Value as IReference).value.ref.nodeKey, "eventTrigger")
  // Test ref
  const ref = (mapTask1.Type.value.map.find(x => x.Key === "ref").Value.Value as IReference).value.ref
  t.equal((ref.path.Selector as IRefSelectorKey).value.key, "dataX")
  t.equal(ref.nodeKey, "eventTrigger")
  // Test ref nested
  const ref_nested = (mapTask1.Type.value.map.find(x => x.Key === "ref_nested").Value.Value as IReference).value.ref
  t.equal(ref.nodeKey, "eventTrigger")
  t.equal((ref_nested.path.Selector as IRefSelectorKey).value.key, "dataX")
  t.equal((ref_nested.path.path.Selector as IRefSelectorKey).value.key, "foo")
  t.equal(ref_nested.path.path.path, null)
  // Test ref list
  const ref_list = (mapTask1.Type.value.map.find(x => x.Key === "ref_list").Value.Value as IReference).value.ref
  t.equal(ref.nodeKey, "eventTrigger")
  t.equal((ref_list.path.Selector as IRefSelectorKey).value.key, "dataY")
  t.equal(ref_list.path.path.path, null)
  t.equal((ref_list.path.path.Selector as IRefSelectorIndex).value.index, undefined)
  // Test ref nested_list
  const ref_nested_list = (mapTask1.Type.value.map.find(x => x.Key === "ref_nested_list").Value.Value as IReference).value.ref
  t.equal(ref.nodeKey, "eventTrigger")
  t.equal((ref_nested_list.path.Selector as IRefSelectorKey).value.key, "dataX")
  t.equal((ref_nested_list.path.path.Selector as IRefSelectorKey).value.key, "bar")
  t.equal(ref_nested_list.path.path.path.path, null)
  t.equal((ref_nested_list.path.path.path.Selector as IRefSelectorIndex).value.index, undefined)
  // Test ref list nested
  const ref_list_nested = (mapTask1.Type.value.map.find(x => x.Key === "ref_list_nested").Value.Value as IReference).value.ref
  t.equal(ref.nodeKey, "eventTrigger")
  t.equal((ref_list_nested.path.Selector as IRefSelectorKey).value.key, "dataY")
  t.equal((ref_list_nested.path.path.Selector as IRefSelectorIndex).value.index, undefined)
  t.equal((ref_list_nested.path.path.path.Selector as IRefSelectorKey).value.key, "bar")
  t.equal(ref_list_nested.path.path.path.path, null)
  // Test ref list nested
  const ref_list_list = (mapTask1.Type.value.map.find(x => x.Key === "ref_list_list").Value.Value as IReference).value.ref
  t.equal(ref.nodeKey, "eventTrigger")
  t.equal((ref_list_list.path.Selector as IRefSelectorKey).value.key, "dataY")
  t.equal((ref_list_list.path.path.Selector as IRefSelectorIndex).value.index, undefined)
  t.equal(ref_list_list.path.path.path.path, null)
  t.equal((ref_list_list.path.path.path.Selector as IRefSelectorIndex).value.index, '1')
  // Test implicit ref
  const implicit_ref = (mapTask1.Type.value.map.find(x => x.Key === "implicit_ref").Value.Value as IReference).value.ref
  t.equal(implicit_ref.nodeKey, "node-1")
  t.equal((implicit_ref.path.Selector as IRefSelectorKey).value.key, "dataX")

  // Test task1
  t.isEquivalent(task1.Type.value.task.instanceHash, env.INSTANCE_HASH)
  t.equal(task1.Type.value.task.taskKey, "taskX")

  // Test map task2
  t.equal(Object.keys(mapTask2.Type.value.map).length, 0)

  // Test task2
  t.isEquivalent(task2.Type.value.task.instanceHash, env.INSTANCE_HASH)
  t.equal(task2.Type.value.task.taskKey, "taskY")

  // Test map task3
  t.equal(Object.keys(mapTask3.Type.value.map).length, 3)
  t.equal((mapTask3.Type.value.map.find(x => x.Key === "a").Value.Value as IReference).value.ref.nodeKey, "task1")
  t.equal(((mapTask3.Type.value.map.find(x => x.Key === "a").Value.Value as IReference).value.ref.path.Selector as IRefSelectorKey).value.key, "resultA")
  t.equal((mapTask3.Type.value.map.find(x => x.Key === "b").Value.Value as IReference).value.ref.nodeKey, "task2")
  t.equal(((mapTask3.Type.value.map.find(x => x.Key === "b").Value.Value as IReference).value.ref.path.Selector as IRefSelectorKey).value.key, "resultB")
  t.equal((mapTask3.Type.value.map.find(x => x.Key === "c").Value.Value as IReference).value.ref.nodeKey, "task2")
  t.equal(((mapTask3.Type.value.map.find(x => x.Key === "c").Value.Value as IReference).value.ref.path.Selector as IRefSelectorKey).value.key, "resultC")

  // Test task3
  t.isEquivalent(task3.Type.value.task.instanceHash, env.INSTANCE_HASH)
  t.equal(task3.Type.value.task.taskKey, "taskZ")
});

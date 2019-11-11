import { AccountGetInputs, AccountGetOutputs, AccountListInputs, AccountListOutputs, AccountCreateInputs, AccountCreateOutputs, AccountDeleteInputs, AccountDeleteOutputs } from './account'
import { EventCreateInputs, EventCreateOutputs, EventStreamInputs, EventStreamOutputs } from './event'
import { ExecutionGetInputs, ExecutionGetOutputs, ExecutionStreamInputs, ExecutionStreamOutputs, ExecutionCreateInputs, ExecutionCreateOutputs, ExecutionUpdateInputs, ExecutionUpdateOutputs } from './execution'
import { InstanceGetInputs, InstanceGetOutputs, InstanceListInputs, InstanceListOutputs } from './instance'
import { RunnerGetInputs, RunnerGetOutputs, RunnerListInputs, RunnerListOutputs, RunnerCreateInputs, RunnerCreateOutputs, RunnerDeleteInputs, RunnerDeleteOutputs } from './runner'
import { ServiceGetInputs, ServiceGetOutputs, ServiceHashInputs, ServiceHashOutputs, ServiceExistsInputs, ServiceExistsOutputs, ServiceListInputs, ServiceListOutputs, ServiceCreateInputs, ServiceCreateOutputs } from './service'
import { ProcessGetInputs, ProcessGetOutputs, ProcessListInputs, ProcessListOutputs, ProcessCreateInputs, ProcessCreateOutputs, ProcessDeleteInputs, ProcessDeleteOutputs } from './process'
import { OwnershipListInputs, OwnershipListOutputs } from './ownership'

export type hash = Uint8Array

export const ExecutionStatus = {
  UNKNOWN: 0,
  CREATED: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
  FAILED: 4
}

export type IApi = {
  account: {
    get: (request: AccountGetInputs) => AccountGetOutputs
    list: (request: AccountListInputs) => AccountListOutputs
    create: (request: AccountCreateInputs) => AccountCreateOutputs
    delete: (request: AccountDeleteInputs) => AccountDeleteOutputs
  },
  event: {
    create: (request: EventCreateInputs) => EventCreateOutputs
    stream: (request: EventStreamInputs) => EventStreamOutputs
  }
  execution: {
    get: (request: ExecutionGetInputs) => ExecutionGetOutputs
    stream: (request: ExecutionStreamInputs) => ExecutionStreamOutputs
    create: (request: ExecutionCreateInputs) => ExecutionCreateOutputs
    update: (request: ExecutionUpdateInputs) => ExecutionUpdateOutputs
  }
  instance: {
    get: (request: InstanceGetInputs) => InstanceGetOutputs
    list: (request: InstanceListInputs) => InstanceListOutputs
  }
  runner: {
    get: (request: RunnerGetInputs) => RunnerGetOutputs
    list: (request: RunnerListInputs) => RunnerListOutputs
    create: (request: RunnerCreateInputs) => RunnerCreateOutputs
    delete: (request: RunnerDeleteInputs) => RunnerDeleteOutputs
  }
  service: {
    get: (request: ServiceGetInputs) => ServiceGetOutputs
    hash: (request: ServiceHashInputs) => ServiceHashOutputs
    exists: (request: ServiceExistsInputs) => ServiceExistsOutputs
    list: (request: ServiceListInputs) => ServiceListOutputs
    create: (request: ServiceCreateInputs) => ServiceCreateOutputs
  },
  process: {
    get: (request: ProcessGetInputs) => ProcessGetOutputs
    list: (request: ProcessListInputs) => ProcessListOutputs
    create: (request: ProcessCreateInputs) => ProcessCreateOutputs
    delete: (request: ProcessDeleteInputs) => ProcessDeleteOutputs
  },
  ownership: {
    list: (request: OwnershipListInputs) => OwnershipListOutputs
  }
}

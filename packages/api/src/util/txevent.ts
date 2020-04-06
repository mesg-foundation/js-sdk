import { TxResult } from "../lcd";

const isAction = (action: string) => (x: any) => x.key === 'action' && x.value === action
const isModule = (module: string) => (x: any) => x.type === module.toLowerCase()
const isHash = (x: any) => x.key === 'hash'

export const findHash = (txResult: TxResult, resourceType: 'Service' | 'Process' | 'Runner'): string[] => {
  return txResult.logs
    .map(x => x.events.find(isModule(resourceType)).attributes)
    .filter(x => x.find(isAction('created')) && x.find(isHash))
    .map(x => x.find(isHash))
    .filter(x => !!x)
    .map(x => x.value)
}
import { TxResult } from "../lcd";

const isAction = (action: string) => (x: any) => x.key === 'action' && x.value === action
const isModule = (module: string) => (x: any) => x.key === 'module' && x.value.toLowerCase() === module.toLowerCase()
const isHash = (x: any) => x.key === 'hash'

export const findHash = (txResult: TxResult, resourceType: 'Service' | 'Process' | 'Runner'): string[] => {
  return txResult.logs
    .map(x => x.events.find(y => y.type === 'message').attributes)
    .filter(x => x.find(isAction(`Create${resourceType}`)) && x.find(isModule(resourceType)) && x.find(isHash))
    .map(x => x.find(isHash))
    .filter(x => !!x)
    .map(x => x.value)
}
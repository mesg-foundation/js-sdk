import { TxResult } from "@mesg/api/lib/lcd";

const isAction = (action: string) => (x: any) => x.key === 'action' && x.value === action
const isModule = (module: string) => (x: any) => x.key === 'module' && x.value === module
const isHash = (x: any) => x.key === 'hash'

export const findHash = (
  txResult: TxResult,
  resourceType: 'service' | 'process',
  action: string
): string[] => {
  return txResult.logs
    .map(x => x.events.find(y => y.type === 'message').attributes)
    .filter(x => x.find(isAction(action)) && x.find(isModule(resourceType)) && x.find(isHash))
    .map(x => x.find(isHash))
    .filter(x => !!x)
    .map(x => x.value)
}
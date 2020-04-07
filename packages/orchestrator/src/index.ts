import Account from '@mesg/api/lib/account-lcd'
import Event from "./event";
import Execution from "./execution";
import Runner from "./runner";

class Orchestrator {
  public event: Event
  public execution: Execution
  public runner: Runner

  constructor(endpoint: string) {
    this.event = new Event(endpoint)
    this.execution = new Execution(endpoint)
    this.runner = new Runner(endpoint)
  }
}

export default Orchestrator;
(module).exports = Orchestrator;

const pk = Account.getPrivateKey(Account.generateMnemonic())
const api = new Orchestrator('localhost:50052')
api.execution.create('J58btTi41BJ6gjFyap9w1eRZnpTrf165vDQfpdiwPpXo', 'xx', {}, pk)
  .then(console.log)
  .catch(console.error)
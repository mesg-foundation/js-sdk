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

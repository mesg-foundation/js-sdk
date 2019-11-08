import * as YAML from 'js-yaml'
import * as fs from 'fs'
import Service from './service'
import API from '@mesg/api'
import * as bs58 from '@mesg/api/lib/util/base58';

const ymlPath = './mesg.yml'

const serviceBuilder = (): Service => {
  const definition = YAML.safeLoad(fs.readFileSync(ymlPath).toString());
  return new Service({
    token: bs58.decode(process.env.MESG_TOKEN),
    definition: definition,
    API: API(process.env.MESG_ENDPOINT)
  });
}

export default serviceBuilder;

export {
  Service
}

export {
  Tasks,
  TaskInputs,
} from './service'
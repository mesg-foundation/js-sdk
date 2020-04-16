import Firebase from 'firebase'
import { EventEmitter } from 'events'
import { IService, IDefinition as IServiceDefinition } from '@mesg/api/lib/service'
import { IProcess, IDefinition as IProcessDefinition } from '@mesg/api/lib/process'
import { IRunner } from '@mesg/api/lib/runner'

export default Firebase.initializeApp({
  apiKey: "AIzaSyDp-sk6i2gICPGv66O13l_ttoitXu9849w",
  authDomain: "platform-f4e92.firebaseapp.com",
  databaseURL: "https://platform-f4e92.firebaseio.com",
  projectId: "platform-f4e92",
  storageBucket: "platform-f4e92.appspot.com",
  messagingSenderId: "581848581612",
  appId: "1:581848581612:web:44440228033335dbc52cc9",
  measurementId: "G-VQKX4K7PTT"
})

export type DeployerEvents<T> = EventEmitter & {
  promise: () => Promise<T>
}

export const deploy = {
  service: async (definition: IServiceDefinition, uid: string): Promise<DeployerEvents<IService>> => deployResource('service', definition, uid),
  process: async (definition: IProcessDefinition, uid: string): Promise<DeployerEvents<IProcess>> => deployResource('process', definition, uid),
  runner: async (definition: { serviceHash: string, env: string[] }, uid: string): Promise<DeployerEvents<IRunner>> => deployResource('runner', definition, uid)
}

const deployResource = async (type: 'service' | 'process' | 'runner', definition: any, uid: string): Promise<DeployerEvents<any>> => {
  const res = await Firebase.firestore().collection('deployments').add({ type, uid, definition })
  const eventEmitter = new EventEmitter() as DeployerEvents<any>

  let unsubscribeLogs: () => void
  let unsubscribeDeployment: () => void

  const clearListeners = () => {
    if (unsubscribeDeployment) unsubscribeDeployment()
    if (unsubscribeLogs) unsubscribeLogs()
  }

  unsubscribeLogs = res.collection('logs').onSnapshot(
    snapshots => {
      for (const change of snapshots.docChanges()) {
        if (change.type !== 'added') continue
        const data = change.doc.data()
        if (data.level === 'error') return eventEmitter.emit('error', new Error(data.message))
        eventEmitter.emit('data', data)
      }
    },
    error => eventEmitter.emit('error', error)
  )

  unsubscribeDeployment = res.onSnapshot(
    async snapshot => {
      const data = snapshot.data()
      if (!data.resourceRef) return
      const resource = await data.resourceRef.get()
      eventEmitter.emit('end', resource.data().definition)
    },
    error => eventEmitter.emit('error', error)
  )
  eventEmitter.on('error', clearListeners)
  eventEmitter.on('end', clearListeners)
  eventEmitter.promise = () => new Promise((resolve, reject) => {
    eventEmitter.on('end', resolve)
    eventEmitter.on('error', reject)
  })
  return eventEmitter
}

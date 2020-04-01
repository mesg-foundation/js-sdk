import Vault from '@mesg/vault'
import FileStore from '@mesg/vault/lib/store/file'
import Firebase from 'firebase'
import { join } from 'path'

const app = Firebase.initializeApp({
  apiKey: "AIzaSyDp-sk6i2gICPGv66O13l_ttoitXu9849w",
  authDomain: "platform-f4e92.firebaseapp.com",
  databaseURL: "https://platform-f4e92.firebaseio.com",
  projectId: "platform-f4e92",
  storageBucket: "platform-f4e92.appspot.com",
  messagingSenderId: "581848581612",
  appId: "1:581848581612:web:44440228033335dbc52cc9",
  measurementId: "G-VQKX4K7PTT"
})

const vaultKey = app.name
const getVault = (configDir: string) => new Vault<Firebase.auth.AuthCredential>(new FileStore(join(configDir, 'credentials.json')))

export const loginFromCredential = async (configDir: string, password: string): Promise<Firebase.auth.UserCredential> => {
  if (!loggedIn(configDir)) throw new Error('no account found, please run `mesg-cli login`')
  const vault = getVault(configDir)
  const credential = vault.get(vaultKey, password) as any
  try {
    return app.auth().signInWithEmailAndPassword(credential.email, credential.password)
  } catch (e) {
    throw new Error(e.message)
  }
}

export const loggedIn = (configDir: string): boolean => {
  const vault = getVault(configDir)
  return vault.contains(vaultKey)
}

export const login = async (configDir: string, email: string, password: string): Promise<Firebase.auth.UserCredential> => {
  if (loggedIn(configDir)) throw new Error('Already logged in')
  const res = await app.auth().signInWithEmailAndPassword(email, password)
  const vault = getVault(configDir)
  vault.set(vaultKey, Firebase.auth.EmailAuthProvider.credential(email, password), password)
  return res
}

export const logout = async (configDir: string) => {
  if (!loggedIn(configDir)) return
  const vault = getVault(configDir)
  vault.remove(vaultKey)
}
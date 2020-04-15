import Vault from '@mesg/vault'
import FileStore from '@mesg/vault/lib/store/file'
import Firebase from 'firebase'
import { join } from 'path'
import firebase from './firebase'

const vaultKey = firebase.name
const getVault = (configDir: string) => new Vault<Firebase.auth.AuthCredential>(new FileStore(join(configDir, 'credentials.json')))

export const loginFromCredential = async (configDir: string, password: string): Promise<Firebase.auth.UserCredential> => {
  if (!loggedIn(configDir)) throw new Error('no account found, please run `mesg-cli login`')
  const vault = getVault(configDir)
  const credential = vault.get(vaultKey, password) as any
  try {
    return firebase.auth().signInWithEmailAndPassword(credential.email, credential.password)
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
  const res = await firebase.auth().signInWithEmailAndPassword(email, password)
  const vault = getVault(configDir)
  vault.set(vaultKey, Firebase.auth.EmailAuthProvider.credential(email, password), password)
  return res
}

export const logout = async (configDir: string) => {
  if (!loggedIn(configDir)) return
  const vault = getVault(configDir)
  vault.remove(vaultKey)
}
import { createHash } from 'crypto'
import { publicKeyCreate, ecdsaSign } from 'secp256k1'
import { fromSeed } from 'bip32'
import { validateMnemonic, mnemonicToSeedSync } from 'bip39'
import LCDClient from "./util/lcdClient"

const HD_PATH = "m/44'/470'/0'/0/0"

export type ITx = {
  msg: any[]
  fee: any
  signatures: any[]
  memo: string
}

export type IMsg = {
  type: string
  value: any
}

export type ICoin = {
  denom: string,
  amount: string
}

export type IDecCoin = {
  denom: string
  amount: number | string
}

export type IFee = {
  amount: ICoin[],
  gas: number | string
}

export type IStdTx = {
  msgs?: IMsg[]
  fee: IFee
  chain_id: string
  account_number: number | string
  sequence: number | string
  memo?: string
}

export default class Transaction {

  private _stdTx: IStdTx
  private _tx: ITx

  constructor(stdTx: IStdTx) {
    if (!stdTx.msgs.length) throw new Error('you need at least one msg in your transaction')
    this._stdTx = this.sortObject(stdTx)
    this._tx = {
      msg: this._stdTx.msgs,
      fee: this._stdTx.fee,
      memo: this._stdTx.memo,
      signatures: []
    }
  }

  addSignatureFromMnemonic(mnemonic: string): Transaction {
    if (!validateMnemonic(mnemonic)) throw new Error('invalid mnemonic')
    const seed = mnemonicToSeedSync(mnemonic)
    const masterKey = fromSeed(seed)
    const cosmosHD = masterKey.derivePath(HD_PATH)
    return this.addSignature(cosmosHD.privateKey)
  }

  addSignature(ecpairPriv: Buffer): Transaction {
    console.log()
    console.log()
    console.log(JSON.stringify(this._stdTx, null, 2))
    console.log()
    console.log()
    const hash = createHash('sha256')
      .update(JSON.stringify(this._stdTx))
      .digest('hex')
    const buf = Buffer.from(hash, 'hex')
    const { signature } = ecdsaSign(buf, ecpairPriv)
    const pubKeyByte = publicKeyCreate(ecpairPriv)

    this._tx.signatures.push({
      signature: Buffer.from(signature).toString('base64'),
      pub_key: {
        type: "tendermint/PubKeySecp256k1",
        value: Buffer.from(pubKeyByte).toString('base64')
      }
    })
    return this
  }

  async broadcast(endpoint: string, mode: 'block' | 'sync' | 'async') {
    console.log(JSON.stringify({
      tx: this._tx,
      mode
    }))
    const client = new LCDClient(endpoint)
    const res = await client.postRequest('/txs', {
      tx: this._tx,
      mode
    })
    console.log(res)
    if (res.raw_log) throw new Error(res.raw_log)
    return res
  }

  private sortObject(obj: any): any {
    if (obj === null) return null
    if (typeof obj !== "object") return obj
    if (Array.isArray(obj)) return obj.map((x) => this.sortObject(x))
    const sortedKeys = Object.keys(obj).sort()
    const result: any = {}
    sortedKeys.forEach(key => {
      result[key] = this.sortObject(obj[key])
    })
    return result
  }
}
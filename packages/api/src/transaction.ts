import { createHash } from 'crypto'
import { publicKeyCreate, ecdsaSign } from 'secp256k1'
import sortObject from './util/sort-object'
import Account from './account-lcd'

export type ITx = {
  msg: any[]
  fee: any
  signatures: any[]
  memo: string
}

export type IMsg<T> = {
  type: string
  value: T
}

export type ICoin = {
  denom: 'atto',
  amount: string
}

export type IDecCoin = {
  denom: 'atto'
  amount: number | string
}

export type IFee = {
  amount: ICoin[],
  gas: number | string
}

export type IStdTx = {
  msgs: IMsg<any>[]
  fee: IFee
  chain_id: string
  account_number: string
  sequence: string
  memo: string
}

export default class Transaction {

  private _stdTx: IStdTx
  public raw: ITx

  static sign(message: string, ecpairPriv: Buffer) {
    const hash = createHash('sha256')
      .update(message)
      .digest('hex')
    const buf = Buffer.from(hash, 'hex')
    return ecdsaSign(buf, ecpairPriv)
  }

  constructor(stdTx: IStdTx) {
    if (!stdTx.msgs.length) throw new Error('you need at least one msg in your transaction')
    this._stdTx = sortObject(stdTx)
    this.raw = {
      msg: this._stdTx.msgs,
      fee: this._stdTx.fee,
      memo: this._stdTx.memo,
      signatures: []
    }
  }

  signWithMnemonic(mnemonic: string, path?: string): Transaction {
    return this.sign(Account.getPrivateKey(mnemonic, path))
  }

  sign(ecpairPriv: Buffer): Transaction {
    const data = JSON.stringify(sortObject(this._stdTx))
    const { signature } = Transaction.sign(data, ecpairPriv)
    const pubKeyByte = publicKeyCreate(ecpairPriv)

    this.raw.signatures.push({
      signature: Buffer.from(signature).toString('base64'),
      pub_key: {
        type: "tendermint/PubKeySecp256k1",
        value: Buffer.from(pubKeyByte).toString('base64')
      }
    })
    return this
  }
}
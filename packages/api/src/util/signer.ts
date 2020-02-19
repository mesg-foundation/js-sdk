export type ITx = {
  msg: any[]
  fee: any
  signatures: any[]
  memo: string
}

export default sign(stdTx: IStdTx, mnemonic: string): ITx {
  console.log()
  console.log(JSON.stringify(this.sortObject(stdTx)))
  console.log()
  const hash = createHash('sha256')
    .update(JSON.stringify(this.sortObject(stdTx)))
    .digest('hex')
  const ecpairPriv = this.privateKeyFromMnemonic(mnemonic)
  const buf = Buffer.from(hash, 'hex')
  const { signature } = ecdsaSign(buf, ecpairPriv)
  console.log(signature.toString())
  return {
    msg: stdTx.msgs,
    fee: stdTx.fee,
    signatures: [
      {
        signature: Buffer.from(signature).toString('base64'),
        pub_key: {
          type: "tendermint/PubKeySecp256k1",
          value: this.getPubKeyBase64(ecpairPriv)
        }
      }
    ],
    memo: stdTx.memo
  }
}
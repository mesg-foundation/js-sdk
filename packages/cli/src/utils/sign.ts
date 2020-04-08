import Transaction from "@mesg/api/lib/transaction"
import sortObject from '@mesg/api/lib/util/sort-object'
import Account from "@mesg/api/lib/account-lcd"

export default (data: Object, mnemonic: string): string => {
  const message = JSON.stringify(sortObject(data))
  const { signature } = Transaction.sign(message, Account.getPrivateKey(mnemonic))
  return Buffer.from(signature).toString('base64')
}
import Command from '../../marketplace-command'
import services from '../../services'

export default class MarketplacePurchase extends Command {
  static description = 'Purchase a service on the MESG Marketplace'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'SERVICE_ID',
    description: 'ID of the service on the MESG Marketplace',
    required: true,
  }, {
    name: 'OFFER_ID',
    description: 'ID of the offer on the MESG Marketplace',
    required: true,
  }]

  async run() {
    const {args} = this.parse(MarketplacePurchase)

    const account = await this.getAccount()
    this.spinner.start('Verifying offer')
    const preparePurchase = await this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.preparePurchase, {
      sid: args.SERVICE_ID,
      offerIndex: args.OFFER_ID,
      from: account,
    })
    this.spinner.stop()
    const passphrase = await this.getPassphrase()
    this.spinner.start('Purchasing offer')
    const signedTxs = []
    for (const tx of preparePurchase.data.transactions) {
      signedTxs.push(await this.sign(account, tx, passphrase))
    }
    const purchase = await this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.publishPurchase, {
      signedTransactions: signedTxs.map(x => x.signedTransaction)
    })
    this.spinner.stop()
    this.styledJSON(purchase.data)
    return purchase.data
  }
}

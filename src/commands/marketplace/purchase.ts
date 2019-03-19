import Command from '../../marketplace-command'
import services from '../../services'

export default class MarketplacePurchase extends Command {
  static description = 'Purchase a service on the MESG Marketplace'

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
    const {data} = await this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.purchase, {
      sid: args.SERVICE_ID,
      offerIndex: args.OFFER_ID,
      from: account,
    })
    this.spinner.stop()
    const passphrase = await this.getPassphrase()
    this.spinner.start('Purchasing offer')
    for (const tx of data.transactions) {
      await this.signAndBroadcast(account, tx, passphrase)
    }
    const purchase = await this.listenEventOnce(
      services.marketplace.id,
      services.marketplace.events.servicePurchased,
      (data: any) => data.sid === args.SERVICE_ID && data.purchaser.toLowerCase() === account.toLowerCase(),
    )
    this.spinner.stop()
    this.styledJSON(purchase)
    return purchase
  }
}

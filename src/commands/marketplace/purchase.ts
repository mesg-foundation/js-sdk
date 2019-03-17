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
    this.spinner.start('Verifying service')
    const purchaseTxs = (await this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.purchase, {
      sid: args.SERVICE_ID,
      offerIndex: args.OFFER_ID,
      from: account,
    })) as unknown as any[]
    const passphrase = await this.getPassphrase()
    this.spinner.status = 'Purchasing service'
    const results = []
    for (const tx of purchaseTxs) {
      results.push(await this.signAndBroadcast(account, tx, passphrase))
    }
    this.spinner.stop('Service purchased')
    this.styledJSON(results)
    return results
  }
}

import {flags} from '@oclif/command'

import Command from '../../marketplace-command'
import services from '../../services'

export default class MarketplacePurchase extends Command {
  static description = 'Purchase a service on the MESG Marketplace'

  static flags = {
    ...Command.flags,
    price: flags.string({
      description: 'the price in MESG Token',
      required: true,
    }),
    duration: flags.string({
      description: 'duration in hour',
      required: true,
    }),
  }

  static args = [{
    name: 'SERVICE_ID',
    description: 'ID of the service on the MESG Marketplace',
    required: true,
  }]

  async run() {
    const {args, flags} = this.parse(MarketplacePurchase)

    const account = await this.getAccount()
    const passphrase = await this.getPassphrase()
    this.spinner.start('Creating offer')
    const {data} = await this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.createOffer, {
      sid: args.SERVICE_ID,
      price: flags.price,
      duration: flags.duration,
      from: account,
    })
    await this.signAndBroadcast(account, data, passphrase)
    this.spinner.stop('Service purchased')
    const offer = await this.listenEventOnce(
      services.marketplace.id,
      services.marketplace.events.serviceOfferCreated,
      (data: any) => data.sid === args.SERVICE_ID,
    )
    this.styledJSON(offer)
    return offer
  }
}

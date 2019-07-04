import {flags} from '@oclif/command'

import Command from '../../marketplace-command'

export default class MarketplaceCreateOffer extends Command {
  static description = 'Create a new offer on a service on the MESG Marketplace'

  static flags = {
    ...Command.flags,
    price: flags.string({
      description: 'Price (in MESG token) of the offer to create',
      required: true,
    }),
    duration: flags.string({
      description: 'Duration (in second) of the offer to create',
      required: true,
    }),
  }

  static args = [{
    name: 'SID',
    description: 'SID of the service on the MESG Marketplace',
    required: true,
  }]

  async run() {
    const {args, flags} = this.parse(MarketplaceCreateOffer)

    const account = await this.getAccount()
    const passphrase = await this.getPassphrase()
    this.spinner.start('Creating offer')
    const prepareOffer = await this.execute({
      instanceHash: await this.engineServiceInstance(Command.SERVICE_NAME),
      taskKey: 'prepareCreateServiceOffer',
      inputs: JSON.stringify({
        sid: args.SID,
        price: flags.price,
        duration: flags.duration,
        from: account,
      })
    })
    const signedTx = await this.sign(account, prepareOffer, passphrase)
    const offer = await this.execute({
      instanceHash: await this.engineServiceInstance(Command.SERVICE_NAME),
      taskKey: 'publishCreateServiceOffer',
      inputs: JSON.stringify(signedTx)
    })
    this.spinner.stop('Offer created')

    this.styledJSON(offer)
    return offer
  }
}

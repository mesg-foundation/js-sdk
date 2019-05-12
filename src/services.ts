export default {
  account: {
    id: 'ethwallet',
    tasks: {
      create: 'create',
      delete: 'delete',
      export: 'export',
      import: 'import',
      importPK: 'importFromPrivateKey',
      list: 'list',
      sign: 'sign',
    }
  },
  marketplace: {
    id: 'marketplace',
    tasks: {
      prepareCreateVersion: 'preparePublishServiceVersion',
      publishCreateVersion: 'publishPublishServiceVersion',
      preparePurchase: 'preparePurchase',
      publishPurchase: 'publishPurchase',
      prepareCreateOffer: 'prepareCreateServiceOffer',
      publishCreateOffer: 'publishCreateServiceOffer',
    }
  }
}

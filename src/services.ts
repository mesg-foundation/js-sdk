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
      createVersion: 'publishServiceVersion',
      sendSignedTransaction: 'sendSignedTransaction',
      purchase: 'purchase',
    }
  }
}

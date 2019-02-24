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
      getService: 'getService',
      exists: 'serviceExist',
      createService: 'createService',
      createVersion: 'createServiceVersion',
      sendSignedTransaction: 'sendSignedTransaction'
    }
  }
}

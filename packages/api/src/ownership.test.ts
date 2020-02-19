import { Test } from 'tape'
import test from 'tape'
import Ownership, { Resource } from './ownership';

const ownershipAPI = new Ownership()

test('ownership list', async function (t: Test) {
  t.plan(1)
  const ownerships = await ownershipAPI.list()
  const ownership = ownerships
    .filter((x) => x.owner === 'mesgtest19k9xsdy42f4a7f7777wj4rs5eh9622h2z7mzdh')
    .filter((x) => x.resource === Resource.Service)
    .filter((x) => x.resourceHash === 'Dodtu7zTjLNmwbyauavch6gZZrzVaWUh6APBzo1mhS2i')
    [0]
  t.equal(ownership.hash, 'GPcQkuE7oBvDVfANNgbXWWNhMXT6Z1z2Z2yeyUPXTeT8')
});

import {expect, test} from '@oclif/test'

describe('wallet/import', () => {
  test
    .stdout()
    .command(['wallet/import'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['wallet/import', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})

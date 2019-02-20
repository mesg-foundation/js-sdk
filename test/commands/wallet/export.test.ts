import {expect, test} from '@oclif/test'

describe('wallet/export', () => {
  test
    .stdout()
    .command(['wallet/export'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['wallet/export', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})

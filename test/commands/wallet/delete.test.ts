import {expect, test} from '@oclif/test'

describe('wallet/delete', () => {
  test
    .stdout()
    .command(['wallet/delete'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['wallet/delete', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})

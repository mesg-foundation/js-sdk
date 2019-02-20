import {expect, test} from '@oclif/test'

describe('wallet/list', () => {
  test
    .stdout()
    .command(['wallet/list'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['wallet/list', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})

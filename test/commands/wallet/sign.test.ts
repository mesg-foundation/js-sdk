import {expect, test} from '@oclif/test'

describe('wallet/sign', () => {
  test
    .stdout()
    .command(['wallet/sign'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['wallet/sign', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})

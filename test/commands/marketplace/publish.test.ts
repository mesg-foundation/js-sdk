import {expect, test} from '@oclif/test'

describe('marketplace/publish', () => {
  test
    .stdout()
    .command(['marketplace/publish'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['marketplace/publish', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})

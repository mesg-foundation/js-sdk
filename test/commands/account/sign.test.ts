import {expect, test} from '@oclif/test'

describe('account/sign', () => {
  test
    .stdout()
    .command(['account/sign'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['account/sign', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})

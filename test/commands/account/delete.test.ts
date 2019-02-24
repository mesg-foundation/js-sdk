import {expect, test} from '@oclif/test'

describe('account/delete', () => {
  test
    .stdout()
    .command(['account/delete'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['account/delete', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})

import {expect, test} from '@oclif/test'

describe('service/dev', () => {
  test
    .stdout()
    .command(['service/dev'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['service/dev', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})

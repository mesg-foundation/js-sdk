import {expect, test} from '@oclif/test'

describe('service/deploy', () => {
  test
    .stdout()
    .command(['service/deploy'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['service/deploy', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})

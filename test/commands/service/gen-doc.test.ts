import {expect, test} from '@oclif/test'

describe('service/gen-doc', () => {
  test
    .stdout()
    .command(['service/gen-doc'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['service/gen-doc', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})

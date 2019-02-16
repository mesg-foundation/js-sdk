import {expect, test} from '@oclif/test'

describe('service/execute', () => {
  test
    .stdout()
    .command(['service/execute'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['service/execute', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})

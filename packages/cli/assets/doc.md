# {{name}} {{#if sid}}(ID: {{sid}}){{/if}}

{{description}}

## Contents

- [Definitions](#Definitions)
{{#if configuration}}
  {{#with configuration}}
    {{#if env}}
- [Environment Variables](#Environment Variables)
    {{/if}}
  {{/with}}
{{/if}}
{{#if events}}
- [Events](#Events)
  {{#each events}}
  - [{{or name key}}](#{{key}})
  {{/each}}
{{/if}}
{{#if tasks}}
- [Tasks](#Tasks)
  {{#each tasks}}
  - [{{or name key}}](#{{key}})
  {{/each}}
{{/if}}

## Definitions

{{#if configuration}}
  {{#with configuration}}
    {{#if env}}    
### Environment Variables
      {{#each env}}
- {{this}}
      {{/each}}
    {{/if}}
  {{/with}}
{{/if}}

{{# if events}}
### Events

  {{#each events}}
#### {{key}}

Event key: `{{key}}`

{{description}}

    {{#if data}}
| **Name** | **Key** | **Type** | **Description** | **Object** |
| --- | --- | --- | --- | --- |
      {{#each data}}
| **{{key}}** | `{{key}}` | `{{type}}{{#if repeated}}[]{{/if}}` | {{#if optional}}**`optional`** {{/if}}{{description}} | {{#if object}} {{toJSON object}} {{/if}} |
      {{/each}}
    {{/if}}
  {{/each}}
{{/if}}

{{#if tasks}}
### Tasks

  {{#each tasks}}
#### {{key}}

Task key: `{{key}}`

{{description}}

    {{#if inputs}}
##### Inputs

| **Name** | **Key** | **Type** | **Description** | **Object** |
| --- | --- | --- | --- | --- |
      {{#each inputs}}
| **{{or name key}}** | `{{key}}` | `{{type}}{{#if repeated}}[]{{/if}}` | {{#if optional}}**`optional`** {{/if}}{{description}} | {{#if object}} {{toJSON object}} {{/if}} |
      {{/each}}
    {{/if}}
  
    {{#if outputs}}
##### Outputs

| **Name** | **Key** | **Type** | **Description** | **Object** |
| --- | --- | --- | --- | --- |
      {{#each outputs}}
| **{{or name key}}** | `{{key}}` | `{{type}}{{#if repeated}}[]{{/if}}` | {{#if optional}}**`optional`** {{/if}}{{description}} | {{#if object}} {{toJSON object}} {{/if}} |
      {{/each}}
    {{/if}}
  {{/each}}
{{/if}}

# {{name}} {{#if sid}}(ID: {{sid}}){{/if}}

{{description}}

## Contents

- [Installation](#Installation)
  - [MESG SDK](#MESG-SDK)
  - [Deploy the Service](#Service)
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

## Installation

### MESG SDK

This service requires [MESG SDK](https://github.com/mesg-foundation/engine) to be installed first.

You can install MESG SDK by running the following command or [follow the installation guide](https://docs.mesg.com/guide/start-here/installation.html).

```bash
npm install -g @mesg/cli
```

### Deploy the Service

To deploy this service, go to [this service page](https://marketplace.mesg.com/services/{{sid}}) on the [MESG Marketplace](https://marketplace.mesg.com) and click the button "get/buy this service".

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

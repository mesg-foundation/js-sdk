# {{name}} {{#if sid}}(ID: {{sid}}){{/if}}

{{description}}

## Contents

- [Installation](#Installation)
  - [MESG SDK](#MESG-SDK)
  - [Deploy the Service](#Service)
- [Definitions](#Definitions)
  {{#if events}}
  - [Events](#Events)
    {{#each events}}
    - [{{or name @key}}](#{{@key}})
    {{/each}}
  {{/if}}
  {{#if tasks}}
  - [Tasks](#Tasks)
  {{#each tasks}}
    - [{{or name @key}}](#{{@key}})
  {{/each}}
{{/if}}

## Installation

### MESG SDK

This service requires [MESG SDK](https://github.com/mesg-foundation/engine) to be installed first.

You can install MESG SDK by running the following command or [follow the installation guide](https://docs.mesg.com/guide/start-here/installation.html).

```bash
npm install -g mesg-cli
```

### Deploy the Service

To deploy this service, go to [this service page](https://marketplace.mesg.com/services/{{sid}}) on the [MESG Marketplace](https://marketplace.mesg.com) and click the button "get/buy this service".

## Definitions

{{# if events}}
### Events

  {{#each events}}
<h4 id="{{@key}}">{{or name @key}}</h4>

Event key: `{{@key}}`

{{description}}

    {{#if data}}
| **Name** | **Key** | **Type** | **Description** |
| --- | --- | --- | --- |
      {{#each data}}
| **{{or name @key}}** | `{{@key}}` | `{{type}}` | {{#if optional}}**`optional`** {{/if}}{{description}} |
      {{/each}}
    {{/if}}
  {{/each}}
{{/if}}

{{#if tasks}}
### Tasks

  {{#each tasks}}
<h4 id="{{@key}}">{{or name @key}}</h4>

Task key: `{{@key}}`

{{description}}

    {{#if inputs}}
##### Inputs

| **Name** | **Key** | **Type** | **Description** |
| --- | --- | --- | --- |
      {{#each inputs}}
| **{{or name @key}}** | `{{@key}}` | `{{type}}` | {{#if optional}}**`optional`** {{/if}}{{description}} |
      {{/each}}
    {{/if}}
  
    {{#if outputs}}
##### Outputs

| **Name** | **Key** | **Type** | **Description** |
| --- | --- | --- | --- |
      {{#each outputs}}
| **{{or name @key}}** | `{{@key}}` | `{{type}}` | {{#if optional}}**`optional`** {{/if}}{{description}} |
      {{/each}}
    {{/if}}
  {{/each}}
{{/if}}
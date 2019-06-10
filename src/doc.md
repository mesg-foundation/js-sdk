# {{name}} {{#if sid}}(ID: {{sid}}){{/if}}

{{description}}

## Contents

- [Installation](#Installation)
  - [MESG Engine](#MESG-Engine)
  - [Deploy the Service](#Service)
- [Definitions](#Definitions)
  {{#if events}}
  - [Events](#Events)
    {{#each events}}
    - [{{or name @key}}](#{{or name @key}})
    {{/each}}
  {{/if}}
  {{#if tasks}}
  - [Tasks](#Tasks)
  {{#each tasks}}
    - [{{or name @key}}](#{{or name @key}})
  {{/each}}
{{/if}}

## Installation

### MESG Engine

This service requires [MESG Engine](https://github.com/mesg-foundation/engine) to be installed first.

You can install MESG Engine by running the following command or [follow the installation guide](https://docs.mesg.com/guide/start-here/installation.html).

```bash
bash <(curl -fsSL https://mesg.com/install)
```

### Deploy the Service

To deploy this service, go to [this service page](https://marketplace.mesg.com/services/{{sid}}) on the [MESG Marketplace](https://marketplace.mesg.com) and click the button "get/buy this service".

## Definitions

{{# if events}}
### Events

  {{#each events}}
#### {{or name @key}}

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
#### {{or name @key}}

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

      {{#each outputs}}
###### {{or name @key}}

Output key: `{{@key}}`

{{description}}

| **Name** | **Key** | **Type** | **Description** |
| --- | --- | --- | --- |
        {{#each data}}
| **{{or name @key}}** | `{{@key}}` | `{{type}}` | {{#if optional}}**`optional`** {{/if}}{{description}} |
        {{/each}}

      {{/each}}
    {{/if}}
  {{/each}}
{{/if}}
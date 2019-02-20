<!-- MESG_GENERATED_DOC -->
# {{name}}

{{description}}

## Contents

- [Installation](#Installation)
  - [MESG Core](#MESG-Core)
  - [Service](#Service)
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

### MESG Core

This service requires [MESG Core](https://github.com/mesg-foundation/core) to be installed first.

You can install MESG Core by running the following command or [follow the installation guide](https://docs.mesg.com/guide/start-here/installation.html).

```bash
bash <(curl -fsSL https://mesg.com/install)
```

### Service

{{#if repository}}To deploy this service, run the following command:
```bash
mesg-core service deploy {{repository}}
```
{{else}}Download the source code of this service, and then in the service's folder, run the following command:
```bash
mesg-core service deploy
```
{{/if}}

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
<!-- /MESG_GENERATED_DOC -->
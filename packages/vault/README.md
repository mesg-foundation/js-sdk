# @mesg/vault

[Website](https://mesg.com/) - [Docs](https://docs.mesg.com/) - [Forum](https://forum.mesg.com/) - [Chat](https://discordapp.com/invite/SaZ5HcE) - [Blog](https://blog.mesg.com)

Store securely your information

# Installation

```bash
npm install @mesg/vault
```

# Usage

```javascript
const Vault = require('@mesg/vault')
const MemoryStore = require('@mesg/vault/lib/store/memory')
const encryptedStore = new MemoryStore()
const vault = new Vault(encryptedStore)

vault.set('my-key', { foo: 'bar' }, 'my-password')
const data = vault.get('my-key', 'my-password')
```

# Store

@mesg/vault can use different stores to store your data.

## Memory store

This store will not persist any data and keep everything in a map in memory.

```javascript
const MemoryStore = require('@mesg/vault/lib/store/memory')
new Vault(new MemoryStore())
```

## File store 

This store will persist the values in a json file on disk (only available in node).

```javascript
const FileStore = require('@mesg/vault/lib/store/file')
new Vault(new FileStore('./store.json'))
```


## Localstorage

This store is only available on browser and will persist on the localstorage of your browser.
```javascript
new Vault(localstorage)
```

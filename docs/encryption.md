# Encryption

Database enryption is based on [Mongo CSFLE][csfle].
This feature an eiher be enable/disabled through the settings,
or fully removed if the project does not require it.

[csfle]: https://docs.mongodb.com/manual/core/security-client-side-encryption/

A command `setupMasterKey` is available as a helper to setup the master key.
Developers may run it after building the application with `yarn build`.

The MongoDB credentials must have at least a read access to the vault collection.
As explained by the MongoDB documentation,
there's also a requirement for MongoDB entreprise as well as the binary `mongocryptd`.

If there's no need for the encryption with CSFLE, MongoDB community can be used instead.

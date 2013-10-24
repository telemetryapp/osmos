# Osmos: a store-agnostic object data mapper for Node.js

Osmos is a object data mapper (ODM) designed to bridge Node.js apps with any data store that support traditional CRUD operations. It's built on three principles:

- **Stay out of the way.** Osmos is intuitive and largely transparent to developers, and, most of all, doesn't attempt to be “smarter” than its human masters. It can also be easily mocked away for testing without having to write specialized code.

- **Fail early, and fail loudly.** Osmos uses Harmony Proxies to trap writes to a document; if attempts are made to read or write non-existent fields, an error is immediately throw to help you and pinpoint mistakes before they end up in production.

- **Don't replace developer knowledge.** Osmos is designed to be a generic ODM that will work well with just about any data store that supports CRUD operations. However, it is _not_ meant to be an abstraction layer; instead, it assumes that developers know best, and provides only a simple interface that can be easily extended through plugins.

The current version of Osmos only supports Riak and Redis, but it should be easy to [write drivers](https://github.com/mtabini/osmos/blob/v0/docs/drivers/drivers.md) for just about any data store—and contributions are warmly welcome!

## Installation

```
npm install osmos-odm
```

Note that Osmos uses Harmony Proxies in order to work. Therefore, you must run your instance of node with the `--harmony_proxies` command-line switch.

## Example:

```javascript
var Osmos = require('osmos-odm');
var Driver = Osmos.drivers.Riak;
var Schema = Osmos.Schema;
var Model = Osmos.Model;
var configurators = Osmos.configurators;

// Register a Riak driver instance

Osmos.registerDriverInstance(
    'db',
    new Driver({ host : 'riak.example.com', port: 8087 });
);

// Define a schema for our documents

var schema = new Schema({
    name: String,
    email: [String, configurators.optional]
});

// Create a model to bridge a schema with a driver 
// instance and data bucket

var model = new Model(schema, 'users', 'db');

// Create a new record

model.create(function(err, doc) {
    if (err) {
        // Handle errors
    }
    
    doc.name = 'Marco';
    
    // doc.email is optional, so we can just ignore it
    
    doc.save(function(err) {
        if (err) {
            // Handle errors
        }
    });
});
```

## Usage

Using Osmos requires the following steps:

1. **Create a driver instance.** A driver instance connects Osmos to a data store. [Learn more about drivers](https://github.com/mtabini/osmos/tree/master/docs/drivers/about.md).

1. **Install and invoke zero or more plugins.** Plugins allow you to extend the functionality provided by Osmos. They are, of course, optional. [Learn more about plugins](https://github.com/mtabini/osmos/blob/v0docs/plugins.md)

1. **Define your schemas.** A schema describes the structure of a document, and defines how its data is transformed and validated. [Learn more about schemas](https://github.com/mtabini/osmos/blob/v0docs/schemas.md)

1. **Define your models.** A model applies a schema to data that is extracted from a data store's specific bucket. [Learn more about models](https://github.com/mtabini/osmos/blob/v0docs/models.md)

1. **CRUD.** Models can be used to create, read, update and delete existing document. Two find methods are also supplied. [Learn more about documents](https://github.com/mtabini/osmos/blob/v0docs/documents.md).

1. **Additional functionality** can be also added to Osmos by a plugin or by a driver—for example, to provide access to features of a data store that are not part of the basic CRUD quartet.

## Contributing

Contributions in the form of patches and pull requests are welcome, provided that you also commit to writing covering unit tests. [Learn more about contributing](https://github.com/mtabini/osmos/blob/v0docs/contributing.md).

## Roadmap

Although Osmos itself is pretty good shape (expect possibly for bugs), its data store support is not; currently, only drivers for Riak and Redis exist, but more are needed.
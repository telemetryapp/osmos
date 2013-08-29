# Osmos drivers

A driver instructs Osmos on how to connect to a specific data store. Drivers are the lowest-level components of Osmos, and a different driver must be written for each data store.

## Supported drivers

At this time, Osmos comes bundled with four drivers:

- **[Memory](https://github.com/mtabini/osmos/blob/master/lib/drivers/memory.js)** (`Osmos.drivers.Memory`) is a simple, unoptimized memory-based data store that Osmos uses primarily for unit testing. It is not meant for production use, but it can be handy for running tests.

- **[Redis](https://github.com/mtabini/osmos/blob/master/docs/drivers/redis.md)** (`Osmos.drivers.Redis`) allows mapping of documents to [Redis](http://redis.io) hashes.

- **[Riak](https://github.com/mtabini/osmos/blob/master/docs/drivers/riak.md)** (`Osmos.drivers.Riak`) allows interfacing with Basho's [Riak](http://basho.com/riak/) database and supports most of its functionality.

- **[RethinkDB](https://github.com/mtabini/osmos/blob/master/docs/drivers/rethinkdb.md)** (`Osmos.drivers.RethinkDB`) allows interfacing with a [RethinkDB](http://www.rethinkdb.com) cluster, and supports atomic updates on a field-by-field basis (ideal for compatibility with PATCH operations).

All built-in drivers reside in the `Osmos.drivers` namespace.

## Using a driver

In order to use a driver, you must instantiate it, thus providing all the appropriate connection data, and then register it with Osmos. For example:

```javascript
var Osmos = require('osmos-odm');
var Riak = Osmos.drivers.Riak;

var db = new Riak({ host : 'riak.example.org' , port : 8087 });

Schema.registerDriverInstance('db', db);
```

You will henceforth be able to reference the driver by its string name when creating a model:

```javascript
var m = new Model(schema, 'bucket', 'db');
```

This makes mocking out databases for testing trivial, since you can just register your mocks instead of the real thing.

## Writing your own drivers

Writing the basic functionality required for a driver is a fairly trivial operation. Things get a little more complicated if you must extend Osmos's functionality to implement advanced features, like transparent indexing or map/reduce operations, that are supported by a specific data store.

For an example of a full-featured driver that digs pretty deep into Osmos's internals, take a peek at the source code for the [Riak driver](https://github.com/mtabini/osmos/tree/master/lib/drivers/riak).

For an in-depth description of the process required for writing a new driver, see [the documentation](https://github.com/mtabini/osmos/blob/master/docs/drivers/drivers.md).

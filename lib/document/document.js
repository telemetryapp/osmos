require('harmony-reflect');
var async = require('async');

var objectProxy = require('./objectproxy.js');

var Document = function OsmosDocument(data, schema, prefix) {
  this.schema = schema;
  this.data = data;
  
  return Proxy(this, objectProxy);
}

Object.defineProperty(
  Document.prototype,
  '__raw__',
  {
    get: function() {
      return this.data;
    }
  }
);

Document.prototype.fullyQualifiedName = function fullyQualifiedNameOfField(name) {
  return this.prefix ? this.prefix + '.' + name : name;
};

Document.prototype.get = function (name) {
  if (name in this || this[name] !== undefined) return this[name];
  if (name in this.schema.properties) {
    var transformer = this.model.transformers[this.fullyQualifiedName(name)];
    var value = this.data[name];
    
    if (transformer && transformer.get) {
      value = transformer.get(value);
    }
    
    return value;
  };
  
  throw new Error('The property ' + name + ' is not part of this document.');
};

Document.prototype.set = function (name, value) {
  if (this.name !== undefined || name in this) {
    this[name] = value;
    return;
  }
  
  if (name in this.schema.properties) {
    var transformer = this.model.transformers[this.fullyQualifiedName(name)];
    
    if (transformer && transformer.set) {
      value = transformer.set(value);
    }
    
    switch(value.constructor.name) {
      case 'object':
        value = new Document(object, this.schema.properties[name], this.prefix ? this.prefix + '.' + name : name);
        break;
        
      case 'array':
        //TODO Array
        break;
    }

    this.data[name] = value;
    return;
  } 
  
  throw new Error('The property ' + name + ' is not part of this document.');
};

Document.prototype.update = function(payload, cb) {
  var updateableProperties;
  
  if ('updateableProperties' in this) {
    updateableProperties = this.updateableProperties;
  }
  
  if (!updateableProperties && this.model) updateableProperties = this.model.updateablePropertiesHash;
  
  if (!updateableProperties) throw new Error('Update called on a document whose model has no updateable properties. See the docs for updateableProperties for more information.');
  if (updateableProperties.constructor.name != 'Object') return cb(new Error('Invalid data payload.', 400));
  
  var self = this;
  
  async.each(
    Object.keys(updateableProperties),
    
    function(key, cb) {
      var prop = payload[key];
      
      if (prop) {
        if (prop.constructor.name == 'Object') {
          self[key] = {};
          self[key].updateableProperties = updateableProperties[key];
          return self[key].update(prop, cb);
        }
        
        self[key] = prop;
      }
      
      cb();
    },
    
    cb
  );
};

module.exports = Document;
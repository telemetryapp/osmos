'use strict';

var expect = require('chai').expect;

var Osmos = require('../lib');

var Schema = Osmos.Schema;

describe('The Schema class', function() {
  
  it('should exist', function() {
    expect(Schema).to.be.a('function');
  });
  
  it('should support JSON-Schema schemas', function() {
    var schema = new Schema(
      'schema',
      {
        $schema: 'http://json-schema.org/draft-04/schema#',
        type: 'object',
        properties: {
          a: {
            type: 'string'
          }
        }
      }
    );
    
    expect(schema).to.be.an('object');
  });
  
  it('should reject invalid schemas', function() {
    function f() {
      new Schema(
        'schema',
        {
          $schema: 'http://json-schema.org/draft-04/schema#',
          type: 'shalala',
          minimum: 10
        }
      );
    }
    
    expect(f).to.throw(Error);
  });
  
  it('should allow registering additional schemas', function(done) {
    Schema.registerSchema('test', {
      $schema: 'http://json-schema.org/draft-04/schema#',
      type: 'number',
      minimum: 10
    });
    
    var schema = new Schema('marco', {
      $schema: 'http://json-schema.org/draft-04/schema#',
      type: 'object',
      properties: {
        val: {
          $ref: 'test'
        }
      }
    });
    
    if (schema.loaded) {
      done();
    }
  });
  
  it('should allow using external schemas', function(done) {
    Schema.registerSchema('test', {
      $schema: 'http://json-schema.org/draft-04/schema#',
      type: 'number',
      minimum: 10
    });
    
    var schema = new Schema('marco', {
      $schema: 'http://json-schema.org/draft-04/schema#',
      type: 'object',
      properties: {
        val: {
          $ref: 'https://raw.github.com/fge/sample-json-schemas/master/geojson/crs.json'
        }
      }
    });

    schema.on('loaded', done);
  });
  
  it('should properly validate a valid document', function(done) {
    var schema = new Schema('marco', {
      $schema: 'http://json-schema.org/draft-04/schema#',
      type: 'object',
      required: ['val'],
      properties: {
        val: {
          type: 'number',
          minimum: 10
        }
      }
    });
    
    schema.validateDocument(
      {val: 11},
      
      function(err) {
        expect(err).to.equal(null);

        done();
      }
    );
  });
  
  it('should report errors when validating an invalid document', function(done) {
    var schema = new Schema('marco', {
      $schema: 'http://json-schema.org/draft-04/schema#',
      type: 'object',
      required: ['val'],
      properties: {
        val: {
          type: 'number',
          minimum: 10
        }
      }
    });
    
    schema.validateDocument(
      {val: 9},
      
      function(err) {
        expect(err).to.be.an('object');
        expect(err).to.be.an.instanceOf(Error);
        expect(err).to.have.property('errors');
        expect(err.errors).to.be.an('array');
        expect(err.errors.length).to.equal(1);
        
        done();
      }
    );
  });
  
  it('should properly support validation hooks', function(done) {
    var schema = new Schema('marco', {
      $schema: 'http://json-schema.org/draft-04/schema#',
      type: 'object',
      required: ['val'],
      properties: {
        val: {
          type: 'number',
          minimum: 10
        }
      }
    });
    
    schema.hook('didValidate', function(doc, cb) {
      cb(new Osmos.Error('Invalid reconfibulator flows detected.', 400));
    });
    
    schema.validateDocument(
      {val: 11},
      
      function(err) {
        expect(err).to.be.an('object');
        expect(err).to.be.an.instanceOf(Error);
        expect(err).to.have.property('errors');
        expect(err.errors).to.be.an('array');
        expect(err.errors.length).to.equal(0);
        
        done();
      }
    );
  });
  
  it('should support format validators', function(done) {
    var schema = new Schema('marco', {
      $schema: 'http://json-schema.org/draft-04/schema#',
      type: 'object',
      required: ['email'],
      properties: {
        email: {
          type: 'string',
          format: 'email'
        }
      }
    });
    
    schema.validateDocument({ email : 'invalid' }, function(err) {
      expect(err).to.be.an('object');
      expect(err).to.be.an.instanceOf(Error);
      expect(err).to.have.property('errors');
      expect(err.errors).to.have.length(1);
      expect(err.errors[0].dataPath).to.equal('/email');
      
      done();
    });
  });

  it('should resolve referenced properties as appropriate', function(done) {
    var s1 = {
      id: 'http://example.com/s1',
      properties:{
        type: {
          type: 'string',
          enum:['a','b']
        }
      },
      required: ['type']
    };

    var s2 = {
      id: 'http://example.com/s2',
      properties: {
        name: {
          type: 'string'
        },
      },
      required: ['name'],
      allOf:[ { $ref : 'http://example.com/s1' } ]
    };

    Schema.registerSchema(s1.id, s1);

    var schema = new Schema(s2.id, s2);

    expect(schema.documentProperties).to.be.an('object');
    expect(schema.documentProperties).to.include.keys(['type', 'name']);

    done();
  });

  it('should allow registering additional formats', function (done) {
    var custom_format_1_data, custom_format_1_schema,
      custom_format_2_data, custom_format_2_schema;

    Schema.registerFormat('custom_format_1', function (data, schema) {
      custom_format_1_data = data;
      custom_format_1_schema = schema;

      return 'custom_format_1_error_message';
    });

    Schema.registerFormat('custom_format_2', function (data, schema) {
      custom_format_2_data = data;
      custom_format_2_schema = schema;
    });

    var schema = new Schema('marco', {
      $schema: 'http://json-schema.org/draft-04/schema#',
      type: 'object',
      properties: {
        foo: {
          type: 'string',
          format: 'custom_format_1'
        },
        foo2: {
          type: 'string',
          format: 'custom_format_2'
        }
      }
    });

    schema.validateDocument({foo: 'bar', foo2: 'bar2'}, function (err) {
      expect(err.errors.length).to.equal(1);
      expect(err.errors[0].dataPath).to.equal('/foo');
      expect(err.errors[0].message).to.equal('Format validation failed (custom_format_1_error_message)');

      expect(custom_format_1_data).to.equal('bar');
      expect(custom_format_1_schema).to.deep.equal({type: 'string', format: 'custom_format_1'});

      expect(custom_format_2_data).to.equal('bar2');
      expect(custom_format_2_schema).to.deep.equal({type: 'string', format: 'custom_format_2'});

      done();
    });
  });

});
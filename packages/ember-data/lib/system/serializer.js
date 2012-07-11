var get = Ember.get;

DS.Serializer = Ember.Object.extend({
  toJSON: function(record, options) {
    options = options || {};

    var hash = {};

    this.addAttributes(hash, record);

    if (options.includeId) {
      this.addId(hash, record);
    }

    this.addRelationships(hash, record);

    return hash;
  },

  addAttributes: function(hash, record) {
    record.eachAttribute(function(name, attribute) {
      var attributeName = this.attributeName(attribute, record);
      var value = get(record, attribute.name);

      hash[attributeName] = this.transform(value, attribute);
    }, this);
  },

  attributeName: function(attribute, record) {
    return attribute.name;
  },

  transform: function(value, attribute) {
    return value;
  },

  addRelationships: function(hash, record) {
    record.eachAssociation(function(name, relationship) {
      if (relationship.kind === 'belongsTo') {
        this.addBelongsTo(hash, record, relationship);
      } else if (relationship.kind === 'hasMany') {
        this.addHasMany(hash, record, relationship);
      }
    }, this);
  },

  addBelongsTo: function() {

  },

  addHasMany: function() {

  },

  addId: function(hash, record) {
    var primaryKey = this.primaryKey(record);
    hash[primaryKey] = get(record, 'id');
  }
});


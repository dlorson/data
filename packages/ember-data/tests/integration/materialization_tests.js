var Person;
var store;
var adapter;
var serializer;

module("Record Materialization", {
  setup: function() {
    Person = DS.Model.extend({
      updatedAt: DS.attr('string'),
      name: DS.attr('string'),
      firstName: DS.attr('string'),
      lastName: DS.attr('string')
    });

    serializer = DS.Serializer.create();
    adapter = DS.Adapter.create({
      serializer: serializer
    });
    store = DS.Store.create({ adapter: adapter });
  },

  teardown: function() {
    adapter.destroy();
    store.destroy();
  }
});

test("the adapter's materialize method should provide attributes to a record", function() {
  store.load(Person, { id: 1, FIRST_NAME: "Yehuda", lAsTnAmE: "Katz" });

  adapter.materialize = function(record, hash) {
    record.materializeAttributes({
      firstName: hash.FIRST_NAME,
      lastName: hash.lAsTnAmE
    });
  };

  var person = store.find(Person, 1);

  equal(person.get('firstName'), "Yehuda");
  equal(person.get('lastName'), "Katz");
});

test("when materializing a record, the serializer's materializeAttributes method should be invoked", function() {
  expect(1);

  store.load(Person, { id: 1, FIRST_NAME: "Yehuda", lAsTnAmE: "Katz" });

  serializer.materializeAttributes = function(record, hash) {
    deepEqual(hash, {
      id: 1,
      FIRST_NAME: "Yehuda",
      lAsTnAmE: "Katz"
    });
  };

  var person = store.find(Person, 1);
});

test("materializeId is called when loading a record but not when materializing it afterwards", function() {
  expect(2);

  serializer.extractId = function(type, hash) {
    equal(type, Person, "extractId is passed the correct type");
    deepEqual(hash, { id: 1, name: "Yehuda Katz" }, "the opaque hash should be passed");

    return 1;
  };

  store.load(Person, { id: 1, name: "Yehuda Katz" });

  // Find record to ensure it gets materialized
  var person = store.find(Person, 1);
});

test("when materializing a record, the serializer's extractHasMany method should be invoked", function() {
  expect(3);

  Person.reopen({
    children: DS.hasMany(Person)
  });

  store.load(Person, { id: 1, children: [ 1, 2, 3 ] });

  serializer.extractHasMany = function(record, hash, relationship) {
    equal(record.constructor, Person);
    deepEqual(hash, {
      id: 1,
      children: [ 1, 2, 3 ]
    });
    equal(relationship.key, 'children');
  };

  var person = store.find(Person, 1);
});

test("when materializing a record, the serializer's extractBelongsTo method should be invoked", function() {
  expect(3);

  Person.reopen({
    father: DS.belongsTo(Person)
  });

  store.load(Person, { id: 1, father: 2 });

  serializer.extractBelongsTo = function(record, hash, relationship) {
    equal(record.constructor, Person);
    deepEqual(hash, {
      id: 1,
      father: 2
    });
    equal(relationship.key, 'father');
  };

  var person = store.find(Person, 1);
});

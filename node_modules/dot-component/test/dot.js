
/**
 * Test dependencies.
 */

var dot = require('..')
  , expect = require('expect.js');

/**
 * Test.
 */

describe('dot', function(){

  describe('get', function(){
    var obj = {
      name: {
        first: "tobi"
      },
      pets: [
        { id: 1, name: 'loki' },
        { id: 2, name: 'jane' }
      ]
    };

    it('should work with simple keys', function(){
      expect(dot.get(obj, 'name')).to.be(obj.name);
    });

    it('should work with nested keys', function(){
      expect(dot.get(obj, 'name.first')).to.be(obj.name.first);
    });

    it('should work with array indexes', function(){
      expect(dot.get(obj, 'pets.1')).to.be(obj.pets[1]);
      expect(dot.get(obj, 'pets.1.name')).to.be(obj.pets[1].name);
    });
  });

  describe('parent', function(){
    var obj = {
      name: {
        first: "tobi"
      },
      pets: [
        { id: 1, name: 'loki' },
        { id: 2, name: 'jane' }
      ]
    };

    it('should get the parent', function(){
      expect(dot.parent(obj, 'name')).to.be(obj);
      expect(dot.parent(obj, 'name.first')).to.be(obj.name);
    });

    it('should get the parent array', function(){
      expect(dot.parent(obj, 'pets.1')).to.be(obj.pets);
    });

    it('should get the parent array item', function(){
      expect(dot.parent(obj, 'pets.1.name')).to.be(obj.pets[1]);
    });

    it('should initialize the path', function(){
      var ret = dot.parent(obj, 'a.b.c.d', true);
      expect(ret).to.be(obj.a.b.c);
    });
  });

  describe('set', function(){
    var obj = {};

    it('should set', function(){
      dot.set(obj, 'name.first', 'tobi');
      dot.set(obj, 'name.last', 'tobo');
      expect(obj).to.eql({
        name: {
          first: 'tobi',
          last: 'tobo'
        }
      });
    });
  });

});

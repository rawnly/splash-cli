
var deromanize = require('../');

describe('deromanize(str)', function(){
  it('should return a number equal to 14', function(){
    deromanize('XIV').should.eql(14);
  });

  it('should return a number equal to 532', function(){
    deromanize('DXXXII').should.eql(532);
  });
});

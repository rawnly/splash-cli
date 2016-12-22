
/**
 * Convert a string in roman numerical format to a number
 *
 * @param {String} str
 * @return {Number} num
 * @api public
 */

module.exports = function(str){
  var str = str.toUpperCase();
  var validator = /^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/;
  var token = /[MDLV]|C[MD]?|X[CL]?|I[XV]?/g;
  var key = {
    M:  1000,
    CM: 900,
    D:  500,
    CD: 400,
    C:  100,
    XC: 90,
    L:  50,
    XL: 40,
    X:  10,
    IX: 9,
    V:  5,
    IV: 4,
    I:  1
  };
  var num = 0, m;

  if (!(str && validator.test(str))) return false;
  while (m = token.exec(str)) {
    num += key[m[0]];
  }

  return num;
};

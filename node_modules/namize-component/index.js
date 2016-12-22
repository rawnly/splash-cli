
/**
 * Makes a string uppercase according to english name conventions
 *
 * @param {String} str
 * @api public
 */

module.exports = function namize(str){
  return str.toLowerCase().replace(/\b[a-z]|(\-[a-z])/g, function(match){
    return match.toUpperCase();
  }).replace(/(\bMc[a-z])|(\-Mc[a-z])/g, function(match){
    return match.substr(0, match.length - 1) + match.substr(-1).toUpperCase();
  });
}

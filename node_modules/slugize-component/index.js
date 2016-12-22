/**
 * Module dependencies
 * */

var standarize = require('standarize');
var namize = require('namize');

/**
 * Slugize a string
 *
 * @param {String} str
 * @api public
 */

module.exports = function(str){
  return standarize(namize(str)).toLowerCase()
       .replace(/ +/g, '-')
       .replace(/[^-\w]/g, '');
};

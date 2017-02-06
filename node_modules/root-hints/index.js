"use strict";

var hints = require("./hints.json");

module.exports = function rootHints(type) {
  if (type === "A" || type === "AAAA") {
    var records = [];
    hints.forEach(function(hint) {
      if (hint[type]) {
        records.push(hint[type]);
      }
    });
    return records;
  } else if (type === undefined) {
    return hints;
  } else {
    throw new Error("Unknown record type: " + type);
  }
};

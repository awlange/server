/*
 * Logging helper 
 *
 * Adrian Lange 12/2013
 */

var timestamp = require("./timestamp");

function log(message) {
  console.log("[" + timestamp.timestamp() + "]  " + message);
}

exports.log = log;

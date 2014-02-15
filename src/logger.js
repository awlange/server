/*
 * Logging helper 
 *
 * Adrian Lange 12/2013
 */

var timestamp = require("./timestamp");

function log(message) {
  console.log("[" + timestamp.timestamp() + "]  " + message);
}

function logReqResp(request, pathname, responseCode) {
  console.log("[" + timestamp.timestamp() + "]  " +
              " IP: " + request.connection.remoteAddress +
              " HTTP: " + request.httpVersion + " " + request.method + " " + pathname +
              " Response: " + responseCode);
}

exports.log = log;
exports.logReqResp = logReqResp;

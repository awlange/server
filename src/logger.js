var timestamp = require("./timestamp");

function log(message) {
  console.log("[" + timestamp.timestamp() + "]  " + message);
}

exports.log = log;

function timestamp() {
  var now = new Date();

  var year   = now.getUTCFullYear();
  var month  = now.getUTCMonth();
  var date   = now.getUTCDate();
  var hour   = now.getUTCHours();
  var minute = now.getUTCMinutes();
  var second = now.getUTCSeconds();
  var millis = now.getUTCMilliseconds();

  var ts = year + "-" + month + "-" + date;
  ts += " | " + hour + ":" + minute + ":" + second + ":" + millis;

  return ts;
}

exports.timestamp = timestamp;

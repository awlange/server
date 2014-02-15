function timestamp() {
  var now = new Date();
  var millis = now.getUTCMilliseconds();
  if (millis < 10) {
    millis = "00" + millis
  } else if (millis < 100) {
    millis = "0" + millis
  }
  return now.toUTCString() + " | " + millis;
}

exports.timestamp = timestamp;

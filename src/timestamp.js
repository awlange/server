function timestamp() {
  var now = new Date();
  return now.toUTCString() + " | " + now.getUTCMilliseconds(); 
}

exports.timestamp = timestamp;

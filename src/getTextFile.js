/*
 * Just read a text file given a path 
 *
 * Adrian Lange 2/2014
 */

var fs = require("fs");

function getTextFile(filePath) {
  return fs.readFileSync(filePath, "utf8", function(err, text) {
    if (err) throw err;
  }).toString();
}

function getTextFileWithTrim(filePath) {
  var str = getTextFile(filePath);
  // Trim added carriage return
  return str.substring(0, str.length-1)
}

exports.getTextFile = getTextFile;
exports.getTextFileWithTrim = getTextFileWithTrim;

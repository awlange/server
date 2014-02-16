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

exports.getTextFile = getTextFile;

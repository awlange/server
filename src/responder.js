/*
 * Response functions 
 *
 * Adrian Lange 12/2013
 */

var logger = require("./logger"),
    fs = require("fs");

function simpleResponse(response, code, contentType, message) {
  response.writeHead(code, {"Content-Type": contentType});
  response.write(message);
  response.end();
  return true;
}

function textFileResponse(response, contentType, path) {
  response.writeHead(200, {"Content-Type": contentType});
  response.write(getTextFile(path));
  response.end();
}

function streamFileResponse(response, path, fileError) {
  var stream = fs.createReadStream(path);
  stream.on('error', function(err) {
    response.writeHead(500);
    response.end();
    logger.log("Response: 500");
    fileError = true;
  });

  response.writeHead(200);
  stream.pipe(response);
  stream.on('end', function() {
    response.end();
    fileError = false;
  });

  return fileError;
}

function imageFileResponse(response, basePath, pathname, cache) {
  if (!(pathname in cache)) {
    streamFileResponse(response, basePath + pathname);
    return;
  }
  response.writeHead(200, {"Content-Type": cache[pathname]["content-type"]});
  response.end(cache[pathname]["img"], "binary");
}

exports.simpleResponse = simpleResponse;
exports.textFileResponse = textFileResponse;
exports.streamFileResponse = streamFileResponse;
exports.imageFileResponse = imageFileResponse;

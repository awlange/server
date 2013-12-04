/*
 * Response functions 
 *
 * Adrian Lange 12/2013
 */

function simpleResponse(response, code, contentType, message) {
  response.writeHead(code, {"Content-Type": contentType});
  response.write(message);
  response.end();
  logger.log("Response: " + code);
}

function textFileResponse(response, contentType, path) {
  response.writeHead(200, {"Content-Type": contentType});
  response.write(getTextFile(path));
  response.end();
  logger.log("Response: 200");
}

function streamFileResponse(response, path, svgType) {
  var stream = fs.createReadStream(path);
  stream.on('error', function(err) {
    response.writeHead(500);
    response.end();
    logger.log("Response: 500");
    return;
  });

  if (svgType) {
    // SVG files
    response.writeHead(200, {"Content-Type": "image/svg+xml"});
  } else {
    response.writeHead(200);
  }
  stream.pipe(response);
  stream.on('end', function() {
    response.end();
    return;
  });
}

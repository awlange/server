/*
 * Response functions 
 *
 * Adrian Lange 12/2013
 */

var logger = require("./logger"),
    utils = require("./utils"),
    fs = require("fs");

// Attempt to list contents of /file and store in memory.
var fileList = []
function initFileList(basePath) { 
  // Add favicon because it's not in the /file directory
  fileList.push(basePath + "/favicon.ico");

  fs.readdir(basePath + "/file", function(err, files) {
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (file != "papers") {
        fileList.push(basePath + "/file/" + file);
      }
    }
    fs.readdir(basePath + "/file/papers", function(err, files) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        fileList.push(basePath + "/file/papers/" + file);
      }
      console.log("File list:");
      console.log(fileList);
    });
  });
}

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

function streamFileResponse(response, request, path) {
  if (!utils.isElementInArray(path, fileList)) {
    notFound(response, request, path);
    return;
  }

  var stream = fs.createReadStream(path);
  stream.on('error', function(err) {
    response.writeHead(500);
    response.end();
    logger.log("Response: 500 for path: " + path);
  });

  response.writeHead(200);
  stream.pipe(response);
  stream.on('end', function() {
    response.end();
  });
}

function imageFileResponse(response, basePath, pathname, cache) {
  if (!(pathname in cache)) {
    notFound(response, request, pathname);
    return;
  }
  response.writeHead(200, {"Content-Type": cache[pathname]["content-type"]});
  response.end(cache[pathname]["img"], "binary");
}

/*
 * Nav click logging
 */
function navResponse(response, query) {
  logger.log("Nav click: " + query);
  response.writeHead(204);
  response.end();
  return true;
}

/*
 * Convenience functions
 */
function notFound(response, request, pathname) {
  simpleResponse(response, 404, "text/html", 
      "<html><body><p>404: Not found.</p></body></html>");
  logger.logReqResp(request, pathname, 404);
}

function forbidden(response, request, pathname) {
  simpleResponse(response, 403, "text/html", 
      "<html><body><p>403: Forbidden.</p></body></html>");
  logger.logReqResp(request, pathname, 403);
}


exports.initFileList = initFileList;
exports.simpleResponse = simpleResponse;
exports.textFileResponse = textFileResponse;
exports.streamFileResponse = streamFileResponse;
exports.imageFileResponse = imageFileResponse;
exports.navResponse = navResponse;
exports.notFound = notFound;
exports.forbidden = forbidden;

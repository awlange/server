/*
 * Main server 
 *
 * Adrian Lange 12/2013
 */

var http = require("http"),
    fs = require("fs"),
    url = require("url"),
    logger = require("./logger"),
    responder = require("./responder"),
    cache = require("./cache"),
    port = process.argv[2] || 8888,
    basePath = process.argv[3] || "defaultPath";

var pathList = {
  "HTML": "/",
  "CSS": "/css/main.css",
  "JS": "/js/main.js",
  "IMG": /\/img\/+/,
  "FILE": /\/file\/+/,
  "FAV": "/favicon.ico"
};

/* 
 * Instantiate cache for text files
 */
cache.setIndex(getTextFile(basePath + "/index.html"));
cache.setCss(getTextFile(basePath + pathList["CSS"]));
cache.setJs(getTextFile(basePath + pathList["JS"]));

/*
 * Create the server
 */
http.createServer(function(request, response) {

  var pathname = url.parse(request.url).pathname;
  logger.log("Request: " + request.httpVersion + " " + request.method + " " + pathname);

  // Only serve GET for specific files for now
  // TODO: Add HEAD service?

  if (request.method == 'GET') {
    if (pathname == pathList["HTML"]) {
      //textFileResponse(response, "text/html", basePath + "/index.html");
      responder.simpleResponse(response, 200, cache.getIndex(), "text/html");
    } else if (pathname == pathList["CSS"]) {
      //textFileResponse(response, "text/css", basePath + pathList["CSS"]);
      responder.simpleResponse(response, 200, cache.getCss(), "text/css");
    } else if (pathname == pathList["JS"]) {
      //textFileResponse(response, "application/javascript", basePath + pathList["JS"]);
      responder.simpleResponse(response, 200, cache.getJs(), "application/javascript");
    } else if (pathname.match(pathList["IMG"]) ||
               pathname.match(pathList["FILE"]) ||
               pathname.match(pathList["FAV"])) {
      responder.streamFileResponse(response, basePath + pathname, pathname.match(/(svg)$/i));
    } else {
      responder.simpleResponse(response, 404, "Not found.", "text/plain");
    }
  }
  else {
    responder.simpleResponse(response, 403, "Forbidden.", "text/plain");
  }

}).listen(port);

logger.log("Server started listening on port: " + port);
logger.log("Using base path = " + basePath);

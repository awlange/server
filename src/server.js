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
  "FAV": "/favicon.ico",
  "ROBOTS": "/robots.txt",
  "HUMANS": "/humans.txt"
};

/* 
 * Instantiate cache for text files
 */
function getTextFile(filePath) {
  return fs.readFileSync(filePath, "utf8", function(err, text) {
    if (err) throw err;
  }).toString();
}

var fileCache = {
  "index": getTextFile(basePath + "/index.html"),
  "css": getTextFile(basePath + pathList["CSS"]),
  "js": getTextFile(basePath + pathList["JS"]),
  "robots": getTextFile(basePath + pathList["ROBOTS"]),
  "humans": getTextFile(basePath + pathList["HUMANS"])
};

/*
 * Create the server
 */
http.createServer(function(request, response) {

  var pathname = url.parse(request.url).pathname;

  // Only serve GET for specific files for now
  // TODO: Add HEAD service?

  if (request.method == 'GET') {
    if (pathname == pathList["HTML"]) {
      responder.simpleResponse(response, 200, "text/html", fileCache["index"]);
      logger.logReqResp(request, pathname, 200);
    } else if (pathname == pathList["CSS"]) {
      responder.simpleResponse(response, 200, "text/css", fileCache["css"]);
      logger.logReqResp(request, pathname, 200);
    } else if (pathname == pathList["JS"]) {
      responder.simpleResponse(response, 200, "application/javascript", fileCache["js"]);
      logger.logReqResp(request, pathname, 200);
    } else if (pathname == pathList["ROBOTS"]) {
      responder.simpleResponse(response, 200, "text/plain", fileCache["robots"]);
      logger.logReqResp(request, pathname, 200);
    } else if (pathname == pathList["HUMANS"]) {
      responder.simpleResponse(response, 200, "text/plain", fileCache["humans"]);
      logger.logReqResp(request, pathname, 200);
    } else if (pathname.match(pathList["IMG"]) ||
               pathname.match(pathList["FILE"]) ||
               pathname.match(pathList["FAV"])) {
      responder.streamFileResponse(response, basePath + pathname, pathname.match(/(svg)$/i));
      logger.logReqResp(request, pathname, 200);
    } else {
      responder.simpleResponse(response, 404, "text/plain", "404: Not found.");
      logger.logReqResp(request, pathname, 404);
    }
  }
  else {
    responder.simpleResponse(response, 403, "text/plain", "403: Forbidden.");
    logger.logReqResp(request, pathname, 403);
  }

}).listen(port);

logger.log("Server started listening on port: " + port);
logger.log("Using base path = " + basePath);

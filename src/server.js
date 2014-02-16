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
  "HUMANS": "/humans.txt",
  "icon-science": "/img/icon-science-small2.svg",
  "icon-dev": "/img/icon-dev-small2.svg",
  "icon-resume": "/img/icon-resume-small2.svg",
  "icon-contact": "/img/icon-contact-small.svg"
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
  "humans": getTextFile(basePath + pathList["HUMANS"]),
  "icon-science": getTextFile(basePath + pathList["icon-science"]),
  "icon-dev": getTextFile(basePath + pathList["icon-dev"]),
  "icon-resume": getTextFile(basePath + pathList["icon-resume"]),
  "icon-contact": getTextFile(basePath + pathList["icon-contact"])
};

/*
 * Create the server
 */
http.createServer(function(request, response) {

  var pathname = url.parse(request.url).pathname;

  // Only serve GET for specific files for now
  // TODO: Add HEAD service?

  if (request.method == 'GET') {

    found = false;
    fileError = false;

    if (pathname == pathList["HTML"]) {
      found = responder.simpleResponse(response, 200, "text/html", fileCache["index"]);
    } else if (pathname == pathList["CSS"]) {
      found = responder.simpleResponse(response, 200, "text/css", fileCache["css"]);
    } else if (pathname == pathList["JS"]) {
      found = responder.simpleResponse(response, 200, "application/javascript", fileCache["js"]);
    } else if (pathname == pathList["ROBOTS"]) {
      found = responder.simpleResponse(response, 200, "text/plain", fileCache["robots"]);
    } else if (pathname == pathList["HUMANS"]) {
      found = responder.simpleResponse(response, 200, "text/plain", fileCache["humans"]);
    } else if (pathname.match(pathList["IMG"]) && pathname.match(/(svg)$/i)) {
      if (pathname == pathList["icon-science"]) {
        found = responder.simpleResponse(response, 200, "image/svg+xml", fileCache["icon-science"]);
      } else if (pathname == pathList["icon-dev"]) {
        found = responder.simpleResponse(response, 200, "image/svg+xml", fileCache["icon-dev"]);
      } else if (pathname == pathList["icon-resume"]) {
        found = responder.simpleResponse(response, 200, "image/svg+xml", fileCache["icon-resume"]);
      } else if (pathname == pathList["icon-contact"]) {
        found = responder.simpleResponse(response, 200, "image/svg+xml", fileCache["icon-contact"]);
      }
    } else if (pathname.match(pathList["IMG"]) ||
               pathname.match(pathList["FILE"]) ||
               pathname.match(pathList["FAV"])) {
      fileError = responder.streamFileResponse(response, basePath + pathname);
      found = true;
    }

    if (!fileError) {
      // 500 errors should get responded and logged elsewhere
      if (found) {
        logger.logReqResp(request, pathname, 200);
      } else {
        responder.simpleResponse(response, 404, "text/plain", "404: Not found.");
        logger.logReqResp(request, pathname, 404);
      }
    }

  } else if (request.method == 'HEAD') {
    responder.simpleResponse(response, 200, "text/html", "");
    logger.logReqResp(request, pathname, 200);
  } else {
    responder.simpleResponse(response, 403, "text/plain", "403: Forbidden.");
    logger.logReqResp(request, pathname, 403);
  }

}).listen(port);

logger.log("Server started listening on port: " + port);
logger.log("Using base path = " + basePath);

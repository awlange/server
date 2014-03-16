/*
 * Main server 
 *
 * Adrian Lange 12/2013
 */

var http = require("http"),
    url = require("url"),
    textfile = require("./getTextFile"),
    logger = require("./logger"),
    responder = require("./responder"),
    renderer = require("./renderer"),
    port = process.argv[2] || 8888,
    basePath = process.argv[3] || "defaultPath";

/* 
 * Instantiate cache for text files
 */
var cache = {
  "index": textfile.getTextFile(basePath + "index.html"),
  "css": textfile.getTextFile(basePath + "css/main.css"),
  "js": textfile.getTextFile(basePath + "js/main.js"),
  "robots": textfile.getTextFile(basePath + "robots.txt"),
  "humans": textfile.getTextFile(basePath + "humans.txt"),
  "icon-home": textfile.getTextFile(basePath + "img/icon-home-small2.svg"),
  "icon-science": textfile.getTextFile(basePath + "img/icon-science-small2.svg"),
  "icon-dev": textfile.getTextFile(basePath + "img/icon-dev-small2.svg"),
  "icon-resume": textfile.getTextFile(basePath + "img/icon-resume-small2.svg"),
  "icon-contact": textfile.getTextFile(basePath + "img/icon-contact-small.svg"),
  "blogTmpl": textfile.getTextFile(basePath + "blog/blogTmpl.html"),
  "articleTmpl": textfile.getTextFile(basePath + "blog/articleTmpl.html"),
  "summaryTmpl": textfile.getTextFile(basePath + "blog/summaryTmpl.html")
};

var pathList = [
  [/^(\/)$/, "INDEX"],
  [/^(\/blog)/, "BLOG"],
  [/^(\/css\/main.css)$/, "CSS"],
  [/^(\/js\/main.js)$/, "JS"],
  [/\/img\/.+(?=.svg)/, "SVG"],
  [/\/img\/.+/, "IMG"],
  [/\/file\/.+/, "FILE"],
  [/^(\/favicon.ico)$/, "FAV"],
  [/^(\/robots.txt)$/, "ROBOTS"],
  [/^(\/humans.txt)$/, "HUMANS"]
];

var svgList = [
  [/^(\/img\/icon-home-small2.svg)$/, "icon-home"],
  [/^(\/img\/icon-science-small2.svg)$/, "icon-science"],
  [/^(\/img\/icon-dev-small2.svg)$/, "icon-dev"],
  [/^(\/img\/icon-resume-small2.svg)$/, "icon-resume"],
  [/^(\/img\/icon-contact-small.svg)$/, "icon-contact"]
];

/*
 * Get key for matching path regex, or return not found
 */
var getKeyFromList = function(list, path) {
  for (i=0; i < list.length; i++) {
    if (list[i][0].test(path)) {
      return list[i][1];
    }
  }
  return "NOT_FOUND"
};

/*
 * Not found response function for convenience
 */
var notFound = function(response, request, pathname) {
  responder.simpleResponse(response, 404, "text/plain", "404: Not found.");
  logger.logReqResp(request, pathname, 404);
}

/*
 * Create the server
 * 
 * Only accepting GET and HEAD
 */
http.createServer(function(request, response) {

  var pathname = url.parse(request.url).pathname;

  // --- HEAD --- //
  if (request.method == 'HEAD') {
    if (getKeyFromList(pathList, pathname) === "NOT_FOUND") {
      notFound(response, request, pathname);
    } else {
      responder.simpleResponse(response, 200, "text/html", "");
      logger.logReqResp(request, pathname, 200);
    }
    return;
  }

  // --- GET --- //
  if (request.method == 'GET') {
    var pathKey = getKeyFromList(pathList, pathname);
    // Catch bad paths here before going further
    if (pathKey === "NOT_FOUND") {
      return notFound(response, request, pathname);
    }

    switch (pathKey) {
      case "INDEX":
        //responder.simpleResponse(response, 200, "text/html", cache["index"]);
        renderer.renderIndexPage(response, request, cache);
        break;
      case "BLOG":
        renderer.renderBlogPage(response, request, cache["blogTmpl"], cache["articleTmpl"], pathname);
        return;
      case "CSS":
        responder.simpleResponse(response, 200, "text/css", cache["css"]);
        break;
      case "JS":
        responder.simpleResponse(response, 200, "application/javascript", cache["js"]);
        break;
      case "ROBOTS":
        responder.simpleResponse(response, 200, "text/plain", cache["robots"]);
        break;
      case "HUMANS":
        responder.simpleResponse(response, 200, "text/plain", cache["humans"]);
        break;
      case "IMG":
        responder.streamFileResponse(response, basePath + pathname);
        break;
      case "FILE":
        responder.streamFileResponse(response, basePath + pathname);
        break;
      case "FAV":
        responder.streamFileResponse(response, basePath + pathname);
        break;
      case "SVG":
        var svgKey = getKeyFromList(svgList, pathname);
        if (svgKey !== "NOT_FOUND") {
          responder.simpleResponse(response, 200, "image/svg+xml", cache[svgKey]);
        }
        break;
      default:
        notFound(response, request, pathname);
        return;
    }

    logger.logReqResp(request, pathname, 200);
    return;
  }

  // --- Invalid HTTP method --- //
  responder.simpleResponse(response, 403, "text/plain", "403: Forbidden.");
  logger.logReqResp(request, pathname, 403);

}).listen(port);

logger.log("Server started listening on port: " + port);
logger.log("Using base path = " + basePath);

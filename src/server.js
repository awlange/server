/*
 * Main server 
 *
 * Adrian Lange 12/2013
 *
 * Example startup command:
 * node server.js 8888 /base/path/where/stuff/is
 */

var http = require("http"),
    fs = require("fs"),
    url = require("url"),
    utils = require("./utils"),
    logger = require("./logger"),
    responder = require("./responder"),
    renderer = require("./renderer"),
    cacher = require("./cacher")
    port = process.argv[2] || 8888,
    basePath = process.argv[3] || "defaultPath";

logger.log("Using base path = " + basePath);

/*
 * Set up /file and /file/papers directory
 */
responder.initFileList(basePath);

/* 
 * Instantiate cache for text files
 */
var cache = cacher.loadTextFileCache(basePath);

/*
 * Instantiate cache for image files
 */
var image_cache = cacher.loadImgFileCache(basePath);

/*
 * Path regex to alias
 */
var pathList = [
  [/^(\/)$/, "INDEX"],
  [/^(\/blog\/archive)$/, "ARCHIVE"],
  [/^(\/blog)/, "BLOG"],
  [/^(\/css\/main\.css)$/, "CSS"],
  [/^(\/js\/main\.js)$/, "JS"],
  [/^(\/js\/vendor\/jquery-1.11.1.min.js)$/, "JQUERY"],
  [/\/img\/.+(?=\.svg)/, "SVG"],
  [/\/img\/.+/, "IMG"],
  [/\/file\/.+/, "FILE"],
  [/^(\/favicon\.ico)$/, "FAV"],
  [/^(\/robots\.txt)$/, "ROBOTS"],
  [/^(\/humans\.txt)$/, "HUMANS"],
  [/^(\/nav)$|^(\/scroller)$/, "NAV"]
];

var svgList = [
  [/^(\/img\/icon-home-small2\.svg)$/, "icon-home"],
  [/^(\/img\/icon-science-small2\.svg)$/, "icon-science"],
  [/^(\/img\/icon-dev-small2\.svg)$/, "icon-dev"],
  [/^(\/img\/icon-resume-small2\.svg)$/, "icon-resume"],
  [/^(\/img\/icon-contact-small\.svg)$/, "icon-contact"],
  [/^(\/img\/icon-blog-small2\.svg)$/, "icon-blog"],
  [/^(\/img\/icon-archive-small2\.svg)$/, "icon-archive"]
];


/*
 * Create the server
 * 
 * Only accepting GET and HEAD
 */
http.createServer(function(request, response) {

  var parsed_url = url.parse(request.url);
  var pathname = parsed_url.pathname;
  var query = parsed_url.query;

  // --- HEAD --- //
  if (request.method == 'HEAD') {
    if (utils.getKeyFromList(pathList, pathname) === "NOT_FOUND") {
      responder.notFound(response, request, pathname);
    } else {
      responder.simpleResponse(response, 200, "text/html", "");
      logger.logReqResp(request, pathname, 200);
    }
    return;
  }

  // --- GET --- //
  if (request.method == 'GET') {
    var pathKey = utils.getKeyFromList(pathList, pathname);
    // Catch bad paths here before going further
    if (pathKey === "NOT_FOUND") {
      return responder.notFound(response, request, pathname);
    }

    switch (pathKey) {
      case "INDEX":
        renderer.renderIndexPage(response, request, cache);
        break;
      case "ARCHIVE":
        renderer.renderArchivePage(response, request, cache, pathname);
        return;
      case "BLOG":
        renderer.renderBlogPage(response, request, cache, pathname);
        return;
      case "CSS":
        responder.simpleResponse(response, 200, "text/css", cache["css"]);
        break;
      case "JS":
        responder.simpleResponse(response, 200, "application/javascript", cache["js"]);
        break;
      case "JQUERY":
        responder.simpleResponse(response, 200, "application/javascript", cache["jquery"]);
        break;
      case "ROBOTS":
        responder.simpleResponse(response, 200, "text/plain", cache["robots"]);
        break;
      case "HUMANS":
        responder.simpleResponse(response, 200, "text/plain", cache["humans"]);
        break;
      case "IMG":
        responder.imageFileResponse(response, request, basePath, pathname, image_cache);
        break;
      case "FILE":
        responder.streamFileResponse(response, request, basePath + pathname);
        break;
      case "FAV":
        responder.streamFileResponse(response, request, basePath + pathname);
        break;
      case "SVG":
        var svgKey = utils.getKeyFromList(svgList, pathname);
        if (svgKey !== "NOT_FOUND") {
          responder.simpleResponse(response, 200, "image/svg+xml", cache[svgKey]);
        } else {
          responder.notFound(response, request, pathname);
        }
        break;
      case "NAV":
        responder.navResponse(response, query);
        break;
      default:
        responder.notFound(response, request, pathname);
        return;
    }

    logger.logReqResp(request, pathname, 200);
    return;
  }

  // --- Invalid HTTP method --- //
  responder.forbidden(response, request, pathname);

}).listen(port);


logger.log("Server started listening on port: " + port);

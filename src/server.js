/*
 * Main server 
 *
 * Adrian Lange 12/2013
 */

var http = require("http"),
    fs = require("fs"),
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
logger.log("Loading text file cache...")
var cache = {
  "index": textfile.getTextFile(basePath + "index.html"),
  "css": textfile.getTextFile(basePath + "css/main.css"),
  "js": textfile.getTextFile(basePath + "js/main.js"),
  "jquery": textfile.getTextFile(basePath + "js/vendor/jquery-1.11.1.min.js"),
  "robots": textfile.getTextFile(basePath + "robots.txt"),
  "humans": textfile.getTextFile(basePath + "humans.txt"),
  "icon-home": textfile.getTextFile(basePath + "img/icon-home-small2.svg"),
  "icon-science": textfile.getTextFile(basePath + "img/icon-science-small2.svg"),
  "icon-dev": textfile.getTextFile(basePath + "img/icon-dev-small2.svg"),
  "icon-resume": textfile.getTextFile(basePath + "img/icon-resume-small2.svg"),
  "icon-contact": textfile.getTextFile(basePath + "img/icon-contact-small.svg"),
  "icon-blog": textfile.getTextFile(basePath + "img/icon-blog-small2.svg"),
  "icon-archive": textfile.getTextFile(basePath + "img/icon-archive-small2.svg"),
  "blogTmpl": textfile.getTextFile(basePath + "blog/blogTmpl.html"),
  "articleTmpl": textfile.getTextFile(basePath + "blog/articleTmpl.html"),
  "summaryTmpl": textfile.getTextFile(basePath + "blog/summaryTmpl.html"),
  "archiveTmpl": textfile.getTextFile(basePath + "blog/archiveTmpl.html")
};

/*
 * Instantiate cache for image files
 */
logger.log("Loading image file cache...")
var image_cache = {
  "/img/FMO-MS-RMD_TOC.png": {
    "img": fs.readFileSync(basePath + "img/FMO-MS-RMD_TOC.png"),
    "content-type": "image/png"
  },
  "/img/LinkedIn_icon.png": {
    "img": fs.readFileSync(basePath + "img/LinkedIn_icon.png"),
    "content-type": "image/png"
  },
  "/img/PE_level_3.png": {
    "img": fs.readFileSync(basePath + "img/PE_level_3.png"),
    "content-type": "image/png"
  },
  "/img/PE_proof_80.png": {
    "img": fs.readFileSync(basePath + "img/PE_proof_80.png"),
    "content-type": "image/png"
  },
  "/img/ade2orbital.png": {
    "img": fs.readFileSync(basePath + "img/ade2orbital.png"),
    "content-type": "image/png"
  },
  "/img/eqDESMO.png": {
    "img": fs.readFileSync(basePath + "img/eqDESMO.png"),
    "content-type": "image/png"
  },
  "/img/genetic.png": {
    "img": fs.readFileSync(basePath + "img/genetic.png"),
    "content-type": "image/png"
  },
  "/img/scalingGraph.png": {
    "img": fs.readFileSync(basePath + "img/scalingGraph.png"),
    "content-type": "image/png"
  },
  "/img/Qchem-logo.gif": {
    "img": fs.readFileSync(basePath + "img/Qchem-logo.gif"),
    "content-type": "image/gif"
  },
  "/img/BuiltInChicago_icon.jpg": {
    "img": fs.readFileSync(basePath + "img/BuiltInChicago_icon.jpg"),
    "content-type": "image/jpg"
  }
};

var pathList = [
  [/^(\/)$/, "INDEX"],
  [/^(\/blog\/archive)$/, "ARCHIVE"],
  [/^(\/blog)/, "BLOG"],
  [/^(\/css\/main.css)$/, "CSS"],
  [/^(\/js\/main.js)$/, "JS"],
  [/^(\/js\/vendor\/jquery-1.11.1.min.js)$/, "JQUERY"],
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
  [/^(\/img\/icon-contact-small.svg)$/, "icon-contact"],
  [/^(\/img\/icon-blog-small2.svg)$/, "icon-blog"],
  [/^(\/img\/icon-archive-small2.svg)$/, "icon-archive"]
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
        responder.imageFileResponse(response, basePath, pathname, image_cache);
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

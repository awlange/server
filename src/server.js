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
var fileCache = {
  "index": textfile.getTextFile(basePath + "index.html"),
  "css": textfile.getTextFile(basePath + "css/main.css"),
  "js": textfile.getTextFile(basePath + "js/main.js"),
  "blogCss": textfile.getTextFile(basePath + "css/blog.css"),
  "robots": textfile.getTextFile(basePath + "robots.txt"),
  "humans": textfile.getTextFile(basePath + "humans.txt"),
  "icon-science": textfile.getTextFile(basePath + "img/icon-science-small2.svg"),
  "icon-dev": textfile.getTextFile(basePath + "img/icon-dev-small2.svg"),
  "icon-resume": textfile.getTextFile(basePath + "img/icon-resume-small2.svg"),
  "icon-contact": textfile.getTextFile(basePath + "img/icon-contact-small.svg"),
  "blogTmpl": textfile.getTextFile(basePath + "blog/blogTmpl.html"),
  "articleTmpl": textfile.getTextFile(basePath + "blog/articleTmpl.html")
};

/*
 * Paths, all regexes
 */
var pathList = {
  "HTML": /^(\/)$/,
  "CSS": /^(\/css\/main.css)$/,
  "JS": /^(\/js\/main.js)$/,
  "BLOG": /^(\/blog)$/,
  "BLOGCSS": /^(\/css\/blog.css)$/,
  "IMG": /\/img\/+/,
  "FILE": /\/file\/+/,
  "FAV": /^(\/favicon.ico)$/,
  "ROBOTS": /^(\/robots.txt)$/,
  "HUMANS": /^(\/humans.txt)$/,
  "icon-science": /^(\/img\/icon-science-small2.svg)$/,
  "icon-dev": /^(\/img\/icon-dev-small2.svg)$/,
  "icon-resume": /^(\/img\/icon-resume-small2.svg)$/,
  "icon-contact": /^(\/img\/icon-contact-small.svg)$/
};

var validPath = function(path) {
  for (key in pathList) {
    if (pathList[key].test(path)) {
      return true;
    }
  }
  return false;
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

  if (request.method == 'GET') {
    // Catch bad paths here before going further
    if (!validPath(pathname)) {
      return notFound(response, request, pathname);
    }

    found = false;
    fileError = false;

    if (pathname.match(pathList["HTML"])) {
      found = responder.simpleResponse(response, 200, "text/html", fileCache["index"]);
    } else if (pathname.match(pathList["CSS"])) {
      found = responder.simpleResponse(response, 200, "text/css", fileCache["css"]);
    } else if (pathname.match(pathList["JS"])) {
      found = responder.simpleResponse(response, 200, "application/javascript", fileCache["js"]);
    } else if (pathname.match(pathList["BLOG"])) {
      renderResults = renderer.renderBlogPage(fileCache["blogTmpl"], fileCache["articleTmpl"], pathname);
      found = renderResults[0];
      if (found) {
        responder.simpleResponse(response, 200, "text/html", renderResults[1]);
      }
    } else if (pathname.match(pathList["BLOGCSS"])) {
      found = responder.simpleResponse(response, 200, "text/css", fileCache["blogCss"]);
    } else if (pathname.match(pathList["ROBOTS"])) {
      found = responder.simpleResponse(response, 200, "text/plain", fileCache["robots"]);
    } else if (pathname.match(pathList["HUMANS"])) {
      found = responder.simpleResponse(response, 200, "text/plain", fileCache["humans"]);
    } else if (pathname.match(pathList["IMG"]) && pathname.match(/(svg)$/i)) {
      if (pathname.match(pathList["icon-science"])) {
        found = responder.simpleResponse(response, 200, "image/svg+xml", fileCache["icon-science"]);
      } else if (pathname.match(pathList["icon-dev"])) {
        found = responder.simpleResponse(response, 200, "image/svg+xml", fileCache["icon-dev"]);
      } else if (pathname.match(pathList["icon-resume"])) {
        found = responder.simpleResponse(response, 200, "image/svg+xml", fileCache["icon-resume"]);
      } else if (pathname.match(pathList["icon-contact"])) {
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
        notFound(response, request, pathname);
      }
    }
    return;
  }

  if (request.method == 'HEAD') {
    if (validPath(pathname)) {
      responder.simpleResponse(response, 200, "text/html", "");
      logger.logReqResp(request, pathname, 200);
    } else {
      notFound(response, request, pathname);
    }
    return;
  }

  // If not one of the above methods
  responder.simpleResponse(response, 403, "text/plain", "403: Forbidden.");
  logger.logReqResp(request, pathname, 403);

}).listen(port);

logger.log("Server started listening on port: " + port);
logger.log("Using base path = " + basePath);

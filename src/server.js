var http = require("http"),
    fs = require("fs"),
    url = require("url"),
    logger = require("./logger"),
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

function simpleResponse(response, code, message) {
  response.writeHead(code);
  response.write(message);
  response.end();
  logger.log("Response: " + code);
}

function getTextFile(filePath) {
  return fs.readFileSync(filePath, "utf8", function(err, text) {
    if (err) throw err;
  }).toString();
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

http.createServer(function(request, response) {

  var pathname = url.parse(request.url).pathname;
  logger.log("Request: " + request.httpVersion + " " + request.method + " " + pathname);

  // Only serve GET for specific files for now
  // TODO: Add HEAD service

  if (request.method == 'GET') {
    if (pathname == pathList["HTML"]) {
      // HTML
      textFileResponse(response, "text/html", basePath + "/index.html");
    } else if (pathname == pathList["CSS"]) {
      // CSS
      textFileResponse(response, "text/css", basePath + pathList["CSS"]);
    } else if (pathname == pathList["JS"]) {
      // JS
      textFileResponse(response, "application/javascript", basePath + pathList["JS"]);
    } else if (pathname.match(pathList["IMG"])) {
      // IMG
      streamFileResponse(response, basePath + pathname, pathname.match(/(svg)$/i));
    } else if (pathname.match(pathList["FILE"]) || pathname.match(pathList["FAV"])) {
      // FILE or favicon
      streamFileResponse(response, basePath + pathname, false);
    } else {
      simpleResponse(response, 404, "Not found.");
    }
  }
  else {
    simpleResponse(response, 403, "Forbidden.");
  }

}).listen(port);

logger.log("Server started listening on port: " + port);
logger.log("Using base path = " + basePath);

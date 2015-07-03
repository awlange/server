/*
 * In-memory caching functions
 *
 * Adrian Lange 9/2014
 */

 var fs = require("fs"),
    logger = require("./logger"),
    textfile = require("./getTextFile");


function loadTextFileCache(basePath) {
  logger.log("Loading text file cache...");
  return {
    "index": textfile.getTextFile(basePath + "/index.html"),
    "css": textfile.getTextFile(basePath + "/css/main.css"),
    "js": textfile.getTextFile(basePath + "/js/main.js"),
    "jquery": textfile.getTextFile(basePath + "/js/vendor/jquery-1.11.1.min.js"),
    "robots": textfile.getTextFile(basePath + "/robots.txt"),
    "humans": textfile.getTextFile(basePath + "/humans.txt"),
    "icon-home": textfile.getTextFile(basePath + "/img/icon-home-small2.svg"),
    "icon-science": textfile.getTextFile(basePath + "/img/icon-science-small2.svg"),
    "icon-dev": textfile.getTextFile(basePath + "/img/icon-dev-small2.svg"),
    "icon-resume": textfile.getTextFile(basePath + "/img/icon-resume-small2.svg"),
    "icon-contact": textfile.getTextFile(basePath + "/img/icon-contact-small.svg"),
    "icon-blog": textfile.getTextFile(basePath + "/img/icon-blog-small2.svg"),
    "icon-archive": textfile.getTextFile(basePath + "/img/icon-archive-small2.svg"),
    "blogTmpl": textfile.getTextFile(basePath + "/blog/blogTmpl.html"),
    "articleTmpl": textfile.getTextFile(basePath + "/blog/articleTmpl.html"),
    "summaryTmpl": textfile.getTextFile(basePath + "/blog/summaryTmpl.html"),
    "archiveTmpl": textfile.getTextFile(basePath + "/blog/archiveTmpl.html")
  };
}

exports.loadTextFileCache = loadTextFileCache;
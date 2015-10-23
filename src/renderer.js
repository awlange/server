/*
 * Render blog templates
 *
 * Using felixge/node-mysql as driver for accessing MySQL database,
 * where the blog data is stored.
 *
 * Adrian Lange 2/2014
 */

var mysql = require('mysql'),
    logger = require("./logger"),
    responder = require("./responder"),
    textfile = require("./getTextFile");


// Connect to MySQL database
var userVal = textfile.getTextFileWithTrim("/usr/local/mysql/.user.txt");
var passwdVal = textfile.getTextFileWithTrim("/usr/local/mysql/.passwd.txt");
var connection = mysql.createConnection({
    host : 'localhost',
    user : userVal,
    password : passwdVal
});
connection.connect();


// For checking invalid entry id pathnames
// Run this after the connection is made to ensure we have this value stored
var maxEntryId = 0;
function getMaxEntryId() {
  if (maxEntryId === 0) {
    connection.query("SELECT entry_id FROM blog.entries ORDER BY entry_id DESC LIMIT 1", function(err, rows, fields) {
      if (err) throw err;
      maxEntryId = rows[0].entry_id;
    });
  }
  return maxEntryId;
}
getMaxEntryId();


function getEntryIdFromPathname(pathname) {
  var splitPath = pathname.split("/");
  var id = splitPath[splitPath.length - 1];
  if (id === "" || id === "blog") {
    return 0;
  }
  var intId = parseInt(id);
  if (intId >= 0) {
    return intId;
  }
  // Otherwise, return not found, signaled by -1
  return -1;
}


/*
 *  Based on pathname, render the appropriate blog article content.
 *  Default for / is the most recent entry.
 *  Otherwise, use the entry_id from the path.
 *  If entry id is not a positive integer or out of range, return not found.
 */
function renderBlogPage(response, request, cache, pathname) {
  var page = "RENDER_NOT_FOUND";  // default, changed below on success

  var mysqlQuery;
  var pathEntryId = getEntryIdFromPathname(pathname);
  if (0 < pathEntryId && pathEntryId <= getMaxEntryId()) {
    mysqlQuery = "SELECT * FROM blog.entries WHERE entry_id = " + pathEntryId;
  } else if (pathEntryId === 0) {
    mysqlQuery = "SELECT * FROM blog.entries ORDER BY date DESC LIMIT 1";
  } else {
    renderResponse(response, request, pathname, page);
    return;
  }

  connection.query(mysqlQuery, function(err, rows, fields) {
    if (err) throw err;

    // If no rows, not found. Possibly from deleted old entry.
    if (rows.length === 0) {
      renderResponse(response, request, pathname, page);
      return;
    }

    var articles = [];
    for (var i=0; i<rows.length; i++) {
      var row = rows[i];
      var split_date = row.date.toString().split("00:00:00");  // split to only get the day/month/year
      var content = {
        "title": row.title,
        "date": split_date[0],
        "body": row.body
      };
      articles.push(renderArticle(cache["articleTmpl"], content));
    }
    page = renderArticlesPage(cache["blogTmpl"], articles);
    renderResponse(response, request, pathname, page);
  });
}


/*
 * Render the index page with the 3 most recent blog article summaries
 */
function renderIndexPage(response, request, cache) {
  // Get 5 most recent entries
  var mysqlQuery = "SELECT * FROM blog.entries ORDER BY date DESC LIMIT 5";

  connection.query(mysqlQuery, function(err, rows, fields) {
    if (err) throw err;

    var summaries = [];
    var summaryTmpl = cache["summaryTmpl"];

    for (var i=0; i<rows.length; i++) {
      var row = rows[i];
      var split_date = row.date.toString().split("00:00:00");  // split to only get the day/month/year
      var content = {
        "entry_id": row.entry_id,
        "title": row.title,
        "date": split_date[0],
        "summary": row.summary
      };
      summaries.push(renderSummary(summaryTmpl, content));
    }

    var indexTmpl = cache["index"];
    var page = renderSummariesPage(indexTmpl, summaries);
    cache["index"] = page;
    renderResponse(response, request, "/", page);
  });
}


/*
 * Render the archive page for the blog. Just a listing of all summaries for now.
 */
function renderArchivePage(response, request, cache, pathname) {
  var page = "RENDER_NOT_FOUND";  // default, changed below on success

  var mysqlQuery = "SELECT * FROM blog.entries ORDER BY date DESC";

  connection.query(mysqlQuery, function(err, rows, fields) {
    if (err) throw err;

    // If no rows, not found. Possibly from deleted old entry.
    if (rows.length === 0) {
      renderResponse(response, request, pathname, page);
      return;
    }

    var summaries = [];
    var summaryTmpl = cache["summaryTmpl"];

    for (var i=0; i<rows.length; i++) {
      var row = rows[i];
      var split_date = row.date.toString().split("00:00:00");  // split to only get the day/month/year
      var content = {
        "entry_id": row.entry_id,
        "title": row.title,
        "date": split_date[0],
        "summary": row.summary
      };
      summaries.push(renderSummary(summaryTmpl, content));
    }

    page = renderSummariesPage(cache["archiveTmpl"], summaries);
    renderResponse(response, request, pathname, page);
  });
}


function renderSummary(summaryTmpl, content) {
  return summaryTmpl.replace("((ENTRY_ID))", content["entry_id"])
    .replace("((TITLE))", content["title"])
    .replace("((DATE))", content["date"])
    .replace("((SUMMARY))", content["summary"]);
}


function renderSummariesPage(indexTmpl, summaries) {
  var str = "";
  for (var i=0; i < summaries.length; i++) {
    str = str.concat(summaries[i]);
  }
  return indexTmpl.replace("((SUMMARIES))", str);
}


function renderArticle(articleTmpl, content) {
  return articleTmpl.replace("((TITLE))", content["title"])
    .replace("((DATE))", content["date"])
    .replace("((BODY))", content["body"]);
}


function renderArticlesPage(blogTmpl, articles) {
  var str = "";
  for (var i=0; i < articles.length; i++) {
    str = str.concat(articles[i]);
  }
  return blogTmpl.replace("((ARTICLES))", str);
}


function renderResponse(response, request, pathname, page) {
  if (page !== "RENDER_NOT_FOUND") {
    responder.simpleResponse(response, 200, "text/html", page);
    logger.logReqResp(request, pathname, 200);
  } else {
    responder.simpleResponse(response, 404, "text/plain", "404: Not found.");
    logger.logReqResp(request, pathname, 404);
  }
}


exports.renderBlogPage = renderBlogPage;
exports.renderIndexPage = renderIndexPage;
exports.renderArchivePage = renderArchivePage;

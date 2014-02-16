/*
 * Render blog templates
 *
 * Adrian Lange 2/2014
 */

var express = require('express');
var app = express();


function renderArticle(articleTmpl, content) {
  return articleTmpl.replace("((TITLE))", content["title"])
    .replace("((DATE))", content["date"])
    .replace("((BODY))", content["body"]);
}


function renderPage(blogTmpl, articles) {
  var page = "";
  for (var i=0; i < articles.length; i++) {
    page = page.concat(articles[i]);
  }
  return blogTmpl.replace("((ARTICLES))", page);
}


function renderBlogPage(blogTmpl, articleTmpl, pathname) {
  var renderSuccess = true;

  // Based on pathname, get the appropriate article content
  // TODO: hook this up to a database
  var content = {
    "title": "test",
    "date": "February 2, 2014",
    "body": "Hello."
  };

  var articles = [];
  articles.push(renderArticle(articleTmpl, content));
  var page = renderPage(blogTmpl, articles);

  return [renderSuccess, page];
}


exports.renderBlogPage = renderBlogPage;

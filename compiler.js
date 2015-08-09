var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var fm = require('front-matter');
// var marked = require('marked');
// var mkdirp = Promise.promisifyAll(require('mkdirp'));
var Liquid = require('liquid-node');
var engine = new Liquid.Engine;
var copy = require('copy');

Promise.promisifyAll(fs);

var makePosts = require('./make-posts');
var POSTS_DIR = './_posts';
var LAYOUTS_DIR = './_layouts';
var SITE_DIR = './_site';
var SITE_VARS = {
	url: ''
};

var makeIndex = function (SITE_VARS) {
	return fs.readFileAsync('./index.html', {encoding: 'utf-8'})
		.then(function (file) {
			return fm(file);
		})
		.then(function (file) {
			return engine.parseAndRender(file.body, {site: SITE_VARS});
		})
		// .tap(console.log)
		.then(function (result) {
			return fs.writeFileAsync(path.join(SITE_DIR, 'index.html'), result);
		})
		.catch(console.error);
};

makePosts(SITE_DIR, LAYOUTS_DIR, POSTS_DIR, SITE_VARS)
.map(function (post) {
	// the actual path to the post when the './_site' directory is actually the root
	var rootUrl = path.normalize(SITE_DIR);
	var truePath = post.vars.filepath.replace(rootUrl, '');
	var fileName = post.name + '.html';

	return {
		title: post.name,
		contents: post.vars.contents,
		url: path.join(truePath, fileName),
	};
})
.then(function (posts) {
	SITE_VARS.posts = posts;
	return SITE_VARS;
})
.then(makeIndex)
.then(console.log)
.catch(console.error);

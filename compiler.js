var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var fm = require('front-matter');
var marked = require('marked');
var mkdirp = Promise.promisifyAll(require('mkdirp'));
var Liquid = require("liquid-node");
var engine = new Liquid.Engine;

Promise.promisifyAll(fs);

var POSTS_DIR = './_posts';
var LAYOUTS_DIR = './_layouts';
var SITE_DIR = './_site';
var SITE_VARS = {
	url: '/'
};

/* TODO: populate SITE_VARS while building posts so that we have a complete list
 * of posts that we can use to build a list for archives, and to populate the
 * index.
 */

var readFile = function (dir, filename) {
	return fs.readFileAsync(path.join(dir, filename), {encoding: 'utf-8'})
		.then(function (contents) {
			return {
				name: path.parse(filename).name,
				contents: contents
			};
		})
		.catch(console.error);
};

var rearrange = function (layouts) {
	// take an array of layouts and return them as a dict by name
	var newLayouts = {};
	layouts.forEach(function (layout) {
		newLayouts[layout.name] = layout.contents;
	});
	return newLayouts;
};

var renderLayout = function (layout) {
	// take a post and a template and render the post using the template
	return layout.render(this.vars);
};

var frontMatter = function (post) {
	post.contents = fm(post.contents);
	return post;
};

var formatPost = function (post) {
	var postVars = post.contents.attributes;
	var name = parseName(post.name);

	postVars.content = marked(post.contents.body);
	postVars.filepath = path.join(SITE_DIR, name.year, name.month, name.day);

	return {
		name: name.title,
		vars: postVars
	};
};

var makeDir = function (file) {
	this.file = file;
	return mkdirp(this.vars.filepath);
};

var saveFile = function (file) {
	var filepath = path.join(this.vars.filepath, this.name + '.html');
	return fs.writeFileAsync(filepath, this.file);
};

var parseName = function (filename) {
	filename = filename.split('-');
	return {
		year: filename.shift(),
		month: filename.shift(),
		day: filename.shift(),
		title: filename.join('-')
	};
};

var layouts = fs.readdirAsync(LAYOUTS_DIR)
	.map(readFile.bind(this, LAYOUTS_DIR))
	.catch(console.error);

var posts = fs.readdirAsync(POSTS_DIR)
	.map(readFile.bind(this, POSTS_DIR))
	.map(frontMatter)
	.map(formatPost)
	// .tap(console.log)
	.catch(console.error);

Promise.join(layouts, posts, function (layouts, posts) {
	layouts = rearrange(layouts);
	posts.forEach(function (post) {
		engine.parse(layouts[post.vars.layout]).bind(post)
		.then(renderLayout)
		.then(makeDir)
		.then(saveFile)
		.catch(console.error);
	});
});

var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var fm = require('front-matter');
var marked = require('marked');
var mkdirp = Promise.promisifyAll(require('mkdirp'));
var Liquid = require("liquid-node");
var engine = new Liquid.Engine;

Promise.promisifyAll(fs);

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

var makePosts = function (SITE_DIR, LAYOUTS_DIR, POSTS_DIR, SITE_VARS) {
	var formatPost = function (post) {
		var postVars = post.contents.attributes;
		var name = parseName(post.name);

		postVars.contents = marked(post.contents.body);
		postVars.filepath = path.join(SITE_DIR, name.year, name.month, name.day);

		return {
			name: name.title,
			vars: postVars
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

	return Promise.join(layouts, posts, function (layouts, posts) {
		layouts = rearrange(layouts);
		return posts.map(function (post) {
			return engine.parse(layouts[post.vars.layout]).bind(post)
				.then(renderLayout)
				.then(makeDir)
				.then(saveFile)
				.then(function () {
					return this;
				});
		});
	});
};

module.exports = makePosts;

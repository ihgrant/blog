var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var fm = require('front-matter');
var Liquid = require("liquid-node");
var marked = require('marked');

var engine = new Liquid.Engine;

Promise.promisifyAll(fs);

var POSTS_DIR = './_posts';
var LAYOUTS_DIR = './_layouts';

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

var renderLayout = function (post, layout) {
	// take a post and a template and render the post using the template
	var postVars = post.contents.attributes;
	postVars.content = marked(post.contents.body);
	return layout.render(postVars);
};

var saveFile = function (file) {
	return fs.writeFileAsync('test', file);
};

var layouts = fs.readdirAsync(LAYOUTS_DIR)
	.map(readFile.bind(this, LAYOUTS_DIR))
	// .then(console.log)
	.catch(console.error);

var frontMatter = function (post) {
	post.contents = fm(post.contents);
	return post;
};

var posts = fs.readdirAsync(POSTS_DIR)
	.map(readFile.bind(this, POSTS_DIR))
	.map(frontMatter)
	// .tap(console.log)
	.catch(console.error);

Promise.join(layouts, posts, function (layouts, posts) {
	layouts = rearrange(layouts);
	posts.forEach(function (post) {
		// console.log(post);
		var layout = layouts[post.contents.attributes.layout];

		engine.parse(layout)
		.then(renderLayout.bind(this, post))
		.then(saveFile)
		.catch(console.error);
	});
});

var parseFilename = function (filename) {
	filename = filename.split('-');
	return {
		year: filename.pop(),
		month: filename.pop(),
		day: filename.pop(),
		title: filename.join(' ')
	};
};

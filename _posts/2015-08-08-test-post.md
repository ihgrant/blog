---
title: Line Breaks in React
layout: post
---
![Special alt text]({{ site.url }}/assets/IMG_20121016_075410.jpg)

Recently I had to output some text from a SQL database to a React UI where said text was formatted with newline characters to appear literally in an Access screen. This caused a small problem with my React display, because while the \n characters were coming through in the data just fine, by default React's interpreter doesn't do anything with them. Instead of formatted text in paragraphs, the paragraphs came through as one throbbing mass of text.

Nulla placerat malesuada est, eu posuere nibh consectetur a. Fusce euismod in nulla dictum tempus. Vestibulum posuere orci at tempor ornare. Mauris pretium ligula in adipiscing scelerisque. Nulla vehicula eros ut ornare faucibus. In dignissim eros tempus libero sodales sodales. Integer varius commodo lacus, vitae pellentesque erat auctor sit amet.

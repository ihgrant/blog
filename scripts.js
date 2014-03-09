/* scripts for blog.chenghiz.net */

window.setInterval(function () {
    'use strict';
    try {
        var c = document.getElementsByClassName('colors')[0].style.backgroundColor.toString();
        c = c.substring(c.indexOf('(') + 1, c.indexOf(')')).split(',');
        var r = rando(+c[0], -5, 5),
            g = rando(+c[1], -5, 5),
            b = rando(+c[2], -2, 2),
            colors = document.getElementsByClassName('colors');
//        document.getElementById('colors-counter').style.color = 'rgb(' + r + ',' + g + ',' + b + ')';
        for (var x=0; x<colors.length; x++) {
            colors[x].style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';
        };
    } catch (e) {
        console.log(e.message);
    }
}, 800);

function rando(v, n, x) {
    'use strict';
	v += Math.floor(Math.random() * (x - n + 1) + n);
	if (v > 235) {
		return 235;
    } else if (v < 0) {
		return 0;
    } else {
		return v;
    }
}

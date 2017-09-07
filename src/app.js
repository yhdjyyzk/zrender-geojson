import * as d3 from 'd3';
import zrender from 'zrender/src/zrender';
import Group from 'zrender/src/container/Group';
import pathTool from 'zrender/src/tool/path';
import util from 'zrender/src/core/util';

let group = new Group();
let zr = zrender.init(document.querySelector("#canvas"));
zr.add(group);

fetch('./dist/china.json')
    .then((data) => {
        data.json().then((data) => {
            let projection = d3.geoMercator()
                .center([119, 38])
                .scale(540);
            let path = d3.geoPath()
                .projection(projection);

            let { features } = data;

            for(let i = 0; i < features.length; i++) {
                let p = pathTool.createFromString(path(features[i]), {
                    style: {
                        lineWidth: 1,
                        stroke: 'red',
                        fill: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
                    },
                });
                p.on('mouseover', function () {
                    this.setStyle('lineWidth', 2);
                    this.setStyle("stroke", "white");
                    this.attr('z', 2);
                });
                p.on("mouseout", function () {
                    this.setStyle('lineWidth', 1);
                    this.setStyle("stroke", "red");
                    this.attr("z", 1);
                });
                group.add(p);
            }
        });
    });

let scale = 1;

document.addEventListener("mousewheel", function (e) {
    if(zr) {
        var storage = zr.storage;
        var els = zr.storage.getDisplayList(true, true);
        var delta = e.wheelDelta;
        var newScale = scale + delta / 1000.0;

        scale = newScale;
        util.each(els, function (el) {
            el.attr("scale", [scale, scale]);
            el.attr('origin', [e.clientX, e.clientY]);
        });
    }
});
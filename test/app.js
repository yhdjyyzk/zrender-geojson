import * as d3 from 'd3';
import zrender from 'zrender/src/zrender';
import Group from 'zrender/src/container/Group';
import Circle from 'zrender/src/graphic/shape/Circle';
import pathTool from 'zrender/src/tool/path';
import parse from '../src/parse';

let group = new Group();
let zr = zrender.init(document.querySelector("#canvas"));
let c = new Circle({
    shape: {
        cx: 200,
        cy: 200,
        r: 50
    },
    style: {
        fill: 'red'
    },
    z: 2
});

zr.add(group);

fetch('./dist/china.json')
    .then((data) => {
            data.json().then((data) => {
                console.log(data);
                let svg = d3.select('#app').append('svg').attr("width", "800px").attr("height", "500px");

                let projection = d3.geoMercator()
                    .center([119, 38])
                    .scale(540);
                let path = d3.geoPath()
                    .projection(projection);

                svg.selectAll("path")
                    .data(data.features)
                    .enter()
                    .append("path")
                    .attr("d", function (d, i) {
                        let p = pathTool.createFromString(path(d), {
                            style: {
                                lineWidth: 1,
                                stroke: 'red',
                                fill: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
                            }
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
                        return path(d);
                    });
            });
        }
    );

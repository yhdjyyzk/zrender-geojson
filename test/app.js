import $ from 'jquery';
import ZRenderGeoJSON from '../src/ZRenderGeoJSON';
import Circle from 'zrender/src/graphic/shape/Circle';
import Polyline from 'zrender/src/graphic/shape/Polyline';
import zrender from 'zrender/src/zrender';

let drawer = new ZRenderGeoJSON();

let getJSON = new Promise(function (resolve, reject) {
    $.getJSON({
        url: '../dist/china.json',
        success: function (data) {
            resolve(data);
        },
        error: function (error) {
            reject(error);
        }
    })
});

getJSON.then(function (data) {
    let lines = drawer.drawGeoJSON(data, 500, {});

    let circle = new Circle({
        shape: {
            cx: 100,
            cy: 100,
            r: 30
        },
        style: {
            fill: 'red'
        }
    });

    let zr = zrender.init(document.getElementById('app'), {
        width: 1000,
        height: 1000
    });

    zr.add(circle);
    for(let i = 0; i < lines.length; i++) {
        zr.add(lines[i])
    }
});


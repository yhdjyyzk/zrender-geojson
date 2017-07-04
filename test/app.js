import $ from 'jquery';
import ZRenderGeoJSON from '../src/ZRenderGeoJSON';
import Circle from 'zrender/src/graphic/shape/Circle';
import Polyline from 'zrender/src/graphic/shape/Polyline';
import zrender from 'zrender/src/zrender';

let drawer = new ZRenderGeoJSON();

let getJSON = new Promise(function (resolve, reject) {
    $.getJSON({
        url: '../dist/world-countries.json',
        success: function (data) {
            resolve(data);
        },
        error: function (error) {
            reject(error);
        }
    })
});

getJSON.then(function (data) {
    let zr = zrender.init(document.getElementById('app'), {
        width: 1000,
        height: 500
    });

    drawer.drawGeoJSON(zr, data, 300, {});
});


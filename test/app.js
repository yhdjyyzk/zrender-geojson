import $ from 'jquery';
import ZRenderGeoJSON from '../src/ZRenderGeoJSON';

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
    drawer.drawGeoJSON(data, 100, {});
});


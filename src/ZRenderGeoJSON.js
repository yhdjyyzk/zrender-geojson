import Group from 'zrender/src/container/Group';
import Line from 'zrender/src/graphic/shape/Line';
import Polyline from 'zrender/src/graphic/shape/Polyline';

let x_values = [];
let y_values = [];
let z_values = [];

export default class ZRenderGeoJSON {
    constructor() {
        this.width = this.height = 0;
        this.zr = null;
    }

    drawGeoJSON(zr, json, radius, options) {
        this.width = zr.getWidth();
        this.height = zr.getHeight();
        this.zr = zr;

        let g = new Group();
        let json_geom = this.parseGeoJSON(json);
        let coordinate_array = [];

        for (let i = 0; i < json_geom.length; i++) {
            if (json_geom[i].type == 'Point') {
                this.convertToPlaneCoords(json_geom[i].coordinates, radius);
                // drawParticle(y_values[0], z_values[0], x_values[0], options);
            }
            else if (json_geom[i].type == 'MultiPoint') {
                for (let j = 0; j < json_geom[i].coordinates.length; j++) {
                    this.convertToPlaneCoords(json_geom[i].coordinates[j], radius);
                    // drawParticle(y_values[0], z_values[0], x_values[0], options);
                }
            }
            else if (json_geom[i].type == 'LineString') {
                coordinate_array = this.createCoordinateArray(json_geom[i].coordinates);

                for (let j = 0; j < coordinate_array.length; j++) {
                    this.convertToPlaneCoords(coordinate_array[j], radius);
                }
            }
            else if (json_geom[i].type == 'Polygon') {
                for (let segment_num = 0; segment_num < json_geom[i].coordinates.length; segment_num++) {
                    coordinate_array = this.createCoordinateArray(json_geom[i].coordinates[segment_num]);

                    for (let j = 0; j < coordinate_array.length; j++) {
                        this.convertToPlaneCoords(coordinate_array[j], radius);
                    }

                    this.drawLine(y_values, z_values, x_values, options)
                }
            }
            else if (json_geom[i].type == 'MultiLineString') {
                for (let segment_num = 0; segment_num < json_geom[i].coordinates.length; segment_num++) {
                    coordinate_array = this.createCoordinateArray(json_geom[i].coordinates[segment_num]);

                    for (let j = 0; j < coordinate_array.length; j++) {
                        this.convertToPlaneCoords(coordinate_array[j], radius);
                    }
                }
            }
            else if (json_geom[i].type == 'MultiPolygon') {
                for (let polygon_num = 0; polygon_num < json_geom[i].coordinates.length; polygon_num++) {
                    for (let segment_num = 0; segment_num < json_geom[i].coordinates[polygon_num].length; segment_num++) {
                        coordinate_array = this.createCoordinateArray(json_geom[i].coordinates[polygon_num][segment_num]);

                        for (let j = 0; j < coordinate_array.length; j++) {
                            this.convertToPlaneCoords(coordinate_array[j], radius);
                        }
                    }
                }
            }
            else {
                throw new Error('The geoJSON is not valid.');
            }
        }
    }

    parseGeoJSON(json) {
        let geometry_array = [];

        if (json.type == 'Feature') {
            geometry_array.push(json.geometry);
        } else if (json.type == 'FeatureCollection') {
            for (let feature_num = 0; feature_num < json.features.length; feature_num++) {
                geometry_array.push(json.features[feature_num].geometry);
            }
        } else if (json.type == 'GeometryCollection') {
            for (let i = 0; i < json.geometries.length; i++) {
                geometry_array.push(json.geometries[i]);
            }
        } else {
            throw new Error('The geoJSON is not valid.');
        }
        //alert(geometry_array.length);
        return geometry_array;
    }

    convertToPlaneCoords(coordinates_array, radius) {
        let lon = coordinates_array[0];
        let lat = coordinates_array[1];

        z_values.push((lat / 180) * radius);
        y_values.push((lon / 180) * radius);
        // console.log(z_values, y_values)
    }

    createCoordinateArray(feature) {
        //Loop through the coordinates and figure out if the points need interpolation.
        let temp_array = [];
        let interpolation_array = [];

        for (let j = 0; j < feature.length; j++) {
            let point1 = feature[j];
            let point2 = feature[j - 1];

            if (j > 0) {
                if (this.needsInterpolation(point2, point1)) {
                    interpolation_array = [point2, point1];
                    interpolation_array = this.interpolatePoints(interpolation_array);

                    for (let inter_j = 0; inter_j < interpolation_array.length; inter_j++) {
                        temp_array.push(interpolation_array[inter_j]);
                    }
                } else {
                    temp_array.push(point1);
                }
            } else {
                temp_array.push(point1);
            }
        }
        return temp_array;
    }

    needsInterpolation(point2, point1) {
        //If the distance between two latitude and longitude values is
        //greater than five degrees, return true.
        let lon1 = point1[0];
        let lat1 = point1[1];
        let lon2 = point2[0];
        let lat2 = point2[1];
        let lon_distance = Math.abs(lon1 - lon2);
        let lat_distance = Math.abs(lat1 - lat2);

        if (lon_distance > 5 || lat_distance > 5) {
            return true;
        } else {
            return false;
        }
    }

    interpolatePoints(interpolation_array) {
        //This function is recursive. It will continue to add midpoints to the
        //interpolation array until needsInterpolation() returns false.
        let temp_array = [];
        let point1, point2;

        for (let j = 0; j < interpolation_array.length - 1; j++) {
            point1 = interpolation_array[j];
            point2 = interpolation_array[j + 1];

            if (this.needsInterpolation(point2, point1)) {
                temp_array.push(point1);
                temp_array.push(this.getMidpoint(point1, point2));
            } else {
                temp_array.push(point1);
            }
        }

        temp_array.push(interpolation_array[interpolation_array.length - 1]);

        if (temp_array.length > interpolation_array.length) {
            temp_array = this.interpolatePoints(temp_array);
        } else {
            return temp_array;
        }
        return temp_array;
    }

    getMidpoint(point1, point2) {
        let midpoint_lon = (point1[0] + point2[0]) / 2;
        let midpoint_lat = (point1[1] + point2[1]) / 2;
        let midpoint = [midpoint_lon, midpoint_lat];

        return midpoint;
    }

    drawLine(x_values, y_values, z_values, options) {
        let points = [];

        for (let i = 0; i < x_values.length - 1; i++) {
            points.push([this.width / 2 + x_values[i], this.height / 2 - y_values[i]]);
            points.push([this.width / 2 + x_values[i + 1], this.height / 2 - y_values[i + 1]]);
        }

        let polyline = new Polyline({
            shape: {
                // x1: this.width / 2 + x_values[i],
                // y1: this.height / 2 - y_values[i],
                // x2: this.width / 2 + x_values[i + 1],
                // y2: this.height / 2 - y_values[i + 1]
                points: points
            },
            style: {
                stroke: this.getRandomColor(),
                fill: this.getRandomColor()
            },
            draggable: true
        });

        this.zr.add(polyline);
        points = [];
        this.resetXYZ();

    }

    getRandomColor() {
        return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
    }

    resetXYZ() {
        x_values.length = 0;
        y_values.length = 0;
        z_values.length = 0;
    }
}
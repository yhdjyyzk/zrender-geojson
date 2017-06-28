import zrender from 'zrender';
import Line from 'zrender/src/graphic/shape/Line';

var x_values = [];
var y_values = [];
var z_values = [];

export default class ZRenderGeoJSON {
    constructor() {

    }

    drawGeoJSON(json, radius, options) {
        let json_geom = this.parseGeoJSON(json);
        var coordinate_array = [];
        // console.log(json_geom);

        for (var geom_num = 0; geom_num < json_geom.length; geom_num++) {
            if (json_geom[geom_num].type == 'Point') {
                this.convertToPlaneCoords(json_geom[geom_num].coordinates, radius);
                // drawParticle(y_values[0], z_values[0], x_values[0], options);

            } else if (json_geom[geom_num].type == 'MultiPoint') {
                for (var point_num = 0; point_num < json_geom[geom_num].coordinates.length; point_num++) {
                    this.convertToPlaneCoords(json_geom[geom_num].coordinates[point_num], radius);
                    // drawParticle(y_values[0], z_values[0], x_values[0], options);
                }

            } else if (json_geom[geom_num].type == 'LineString') {
                coordinate_array = this.createCoordinateArray(json_geom[geom_num].coordinates);

                for (var point_num = 0; point_num < coordinate_array.length; point_num++) {
                    this.convertToPlaneCoords(coordinate_array[point_num], radius);
                }
                this.drawLine(y_values, z_values, x_values, options);

            } else if (json_geom[geom_num].type == 'Polygon') {
                for (var segment_num = 0; segment_num < json_geom[geom_num].coordinates.length; segment_num++) {
                    coordinate_array = this.createCoordinateArray(json_geom[geom_num].coordinates[segment_num]);

                    for (var point_num = 0; point_num < coordinate_array.length; point_num++) {
                        this.convertToPlaneCoords(coordinate_array[point_num], radius);
                    }
                    this.drawLine(y_values, z_values, x_values, options);
                }

            } else if (json_geom[geom_num].type == 'MultiLineString') {
                for (var segment_num = 0; segment_num < json_geom[geom_num].coordinates.length; segment_num++) {
                    coordinate_array = this.createCoordinateArray(json_geom[geom_num].coordinates[segment_num]);

                    for (var point_num = 0; point_num < coordinate_array.length; point_num++) {
                        this.convertToPlaneCoords(coordinate_array[point_num], radius);
                    }
                    this.drawLine(y_values, z_values, x_values, options);
                }

            } else if (json_geom[geom_num].type == 'MultiPolygon') {
                for (var polygon_num = 0; polygon_num < json_geom[geom_num].coordinates.length; polygon_num++) {
                    for (var segment_num = 0; segment_num < json_geom[geom_num].coordinates[polygon_num].length; segment_num++) {
                        coordinate_array = this.createCoordinateArray(json_geom[geom_num].coordinates[polygon_num][segment_num]);

                        for (var point_num = 0; point_num < coordinate_array.length; point_num++) {
                            this.convertToPlaneCoords(coordinate_array[point_num], radius);
                        }
                        this.drawLine(y_values, z_values, x_values, options);
                    }
                }
            } else {
                throw new Error('The geoJSON is not valid.');
            }
        }
    }

    parseGeoJSON(json) {
        var geometry_array = [];

        if (json.type == 'Feature') {
            geometry_array.push(json.geometry);
        } else if (json.type == 'FeatureCollection') {
            for (var feature_num = 0; feature_num < json.features.length; feature_num++) {
                geometry_array.push(json.features[feature_num].geometry);
            }
        } else if (json.type == 'GeometryCollection') {
            for (var geom_num = 0; geom_num < json.geometries.length; geom_num++) {
                geometry_array.push(json.geometries[geom_num]);
            }
        } else {
            throw new Error('The geoJSON is not valid.');
        }
        //alert(geometry_array.length);
        return geometry_array;
    }

    convertToPlaneCoords(coordinates_array, radius) {
        var lon = coordinates_array[0];
        var lat = coordinates_array[1];

        z_values.push((lat / 180) * radius);
        y_values.push((lon / 180) * radius);
    }

    createCoordinateArray(feature) {
        //Loop through the coordinates and figure out if the points need interpolation.
        var temp_array = [];
        var interpolation_array = [];

        for (var point_num = 0; point_num < feature.length; point_num++) {
            var point1 = feature[point_num];
            var point2 = feature[point_num - 1];

            if (point_num > 0) {
                if (this.needsInterpolation(point2, point1)) {
                    interpolation_array = [point2, point1];
                    interpolation_array = this.interpolatePoints(interpolation_array);

                    for (var inter_point_num = 0; inter_point_num < interpolation_array.length; inter_point_num++) {
                        temp_array.push(interpolation_array[inter_point_num]);
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
        var lon1 = point1[0];
        var lat1 = point1[1];
        var lon2 = point2[0];
        var lat2 = point2[1];
        var lon_distance = Math.abs(lon1 - lon2);
        var lat_distance = Math.abs(lat1 - lat2);

        if (lon_distance > 5 || lat_distance > 5) {
            return true;
        } else {
            return false;
        }
    }

    interpolatePoints(interpolation_array) {
        //This function is recursive. It will continue to add midpoints to the
        //interpolation array until needsInterpolation() returns false.
        var temp_array = [];
        var point1, point2;

        for (var point_num = 0; point_num < interpolation_array.length - 1; point_num++) {
            point1 = interpolation_array[point_num];
            point2 = interpolation_array[point_num + 1];

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
        var midpoint_lon = (point1[0] + point2[0]) / 2;
        var midpoint_lat = (point1[1] + point2[1]) / 2;
        var midpoint = [midpoint_lon, midpoint_lat];

        return midpoint;
    }

    drawLine(x_values, y_values, z_values, options) {
        console.log(x_values, y_values);
    }
}
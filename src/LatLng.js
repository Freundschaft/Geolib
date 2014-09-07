/**
 * Created by Qiong Wu on 24.04.2014.
 */

var R = 6371; // earth's mean radius in km

/**
 * Extend the Number object to convert degrees to radians
 *
 * @return {Number} Bearing in radians
 * @ignore
 */
Number.prototype.toRad = function () {
    return this * Math.PI / 180;
};

/**
 * Extend the Number object to convert radians to degrees
 *
 * @return {Number} Bearing in degrees
 * @ignore
 */
Number.prototype.toDeg = function () {
    return this * 180 / Math.PI;
};

/**
 * Normalize a heading in degrees to between 0 and +360
 *
 * @return {Number} Return
 * @ignore
 */
Number.prototype.toBrng = function () {
    return (this.toDeg() + 360) % 360;
};

function LatLng(latitude, longitude) {
    this.latitude = parseFloat(latitude);
    this.longitude = parseFloat(longitude);
}

/* Based on the Latitude/longitude spherical geodesy formulae & scripts
 at http://www.movable-type.co.uk/scripts/latlong.html
 (c) Chris Veness 2002-2010
 */
LatLng.prototype.rhumbDestinationPoint = function (brng, dist) {
    var d = parseFloat(dist) / R;  // d = angular distance covered on earth's surface
    var lat1 = this.latitude.toRad(), lon1 = this.longitude.toRad();
    brng = brng.toRad();

    var lat2 = lat1 + d * Math.cos(brng);
    var dLat = lat2 - lat1;
    var dPhi = Math.log(Math.tan(lat2 / 2 + Math.PI / 4) / Math.tan(lat1 / 2 + Math.PI / 4));
    var q = (Math.abs(dLat) > 1e-10) ? dLat / dPhi : Math.cos(lat1);
    var dLon = d * Math.sin(brng) / q;
    // check for going past the pole
    if (Math.abs(lat2) > Math.PI / 2) {
        lat2 = lat2 > 0 ? Math.PI - lat2 : -(Math.PI - lat2);
    }
    var lon2 = (lon1 + dLon + Math.PI) % (2 * Math.PI) - Math.PI;

    if (isNaN(lat2) || isNaN(lon2)) {
        return null;
    }

    return  {"latitude": lat2.toDeg(), "longitude": lon2.toDeg()};
};

LatLng.prototype.rhumbBearingTo = function (dest) {
    var dLon = (dest.longitude - this.longitude).toRad();
    var dPhi = Math.log(Math.tan(dest.latitude.toRad() / 2 + Math.PI / 4) / Math.tan(this.latitude.toRad() / 2 + Math.PI / 4));
    if (Math.abs(dLon) > Math.PI) {
        dLon = dLon > 0 ? -(2 * Math.PI - dLon) : (2 * Math.PI + dLon);
    }
    return Math.atan2(dLon, dPhi).toBrng();
};

/** Trims whitespace from string (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (typeof String.prototype.trim == 'undefined') {
    String.prototype.trim = function() {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }
}

/**
 *
 * http://www.movable-type.co.uk/scripts/latlong.html
 * Returns the destination point from this point having travelled the given distance (in km) on the
 * given initial bearing (bearing may vary before destination is reached)
 *
 *   see http://williams.best.vwh.net/avform.htm#LL
 *
 * @param   {Number} brng: Initial bearing in degrees
 * @param   {Number} dist: Distance in km
 * @returns {LatLng} Destination point
 */
LatLng.prototype.destinationPoint = function(brng, dist) {
    dist = typeof(dist)=='number' ? dist : typeof(dist)=='string' && dist.trim()!='' ? +dist : NaN;
    dist = dist/R;  // convert dist to angular distance in radians
    brng = brng.toRad();  //
    var lat1 = this.latitude.toRad(), lon1 = this.longitude.toRad();

    var lat2 = Math.asin( Math.sin(lat1)*Math.cos(dist) +
        Math.cos(lat1)*Math.sin(dist)*Math.cos(brng) );
    var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(dist)*Math.cos(lat1),
            Math.cos(dist)-Math.sin(lat1)*Math.sin(lat2));
    lon2 = (lon2+3*Math.PI) % (2*Math.PI) - Math.PI;  // normalise to -180..+180º

    return new LatLng(lat2.toDeg(), lon2.toDeg());
}

module.exports = LatLng;
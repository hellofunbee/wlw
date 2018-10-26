// var http="http://39.107.119.69:8087/";
// var img="http://39.107.119.69:8087";

var http="http://localhost:8087/";
var img="http://localhost:8087";

var mutil = {};
mutil.cutSize = function (str, n) {
    if (!str)return "";
    var r = /[^\x00-\xff]/g;
    if (str.replace(r, "mm").length <= n) {
        return str
    }
    var m = Math.floor(n / 2);
    for (var i = m; i < str.length; i++) {
        if (str.substr(0, i).replace(r, "mm").length >= n) {
            return str.substr(0, i) + "..."
        }
    }
    return str
};

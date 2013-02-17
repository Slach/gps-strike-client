var CLOUDMADE_API_KEY = '4fda32fa724643e290021785e2cb107a';
var CLOUDMADE_TOKEN = '';
var CLOUDMADE_STYLE_ID=	30317;
var CLOUDMADE_TILE_SIZE=256;

var GET_CURRENT_COORDS = {
   maximumAge: 3*60*1000,
   timeout: 20*1000,
   enableHighAccuracy: true
};


var WATCH_CURRENT_COORDS = {
   maximumAge: 5*60*1000,
   timeout: 60*1000,
   frequency: 10*1000,
   enableHighAccuracy: true
};

var RECONNECT_TIMEOUT = 5*1000;
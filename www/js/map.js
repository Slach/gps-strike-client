var map = null;
var iconWidth = parseInt(Math.min(screen.height,screen.width) / 10);
console.log('GPS-STRIKE: iconWidth='+iconWidth);

var RedPlayerIcon=new L.Icon({
    iconUrl: 'i/red-player.png',
    iconSize: new L.Point(iconWidth, iconWidth)
});

var BluePlayerIcon = new L.Icon({
    iconUrl: 'i/blue-player.png',
    iconSize: new L.Point(iconWidth, iconWidth)
});

var DeadPlayerIcon = new L.Icon({
    iconUrl: 'i/dead-player.png',
    iconSize: new L.Point(iconWidth, iconWidth)
});


var EAttackOptions = {
	color: '#080',
	clickable: false,
}

var MAttackOptions = {
	color: '#080',
	clickable: false,
}


function geoLocationError(err) {
  console.log('GPS-STRIKE: geoLocationError ['+err.code+']'+err.message);
}


function map_get_cloudmade_token() {
  $('#map').html('Get CLOUDMADE_TOKEN...');
  $.ajax({
    type: 'POST',
    url: 'http://auth.cloudmade.com/token/'+CLOUDMADE_API_KEY+'?userid=gpsstrike&deviceid='+device.uuid,
    data: {},
    dataType: 'text',
    async: false,
    crossDomain: true,
    success: function(response) {
    	CLOUDMADE_TOKEN=response
    },
    error: function(xhr, type) { navigator.notification.alert('getCloudMadeToken error '+type); }
  });
  console.log('GPS-STRIKE: CLOUDMADE_TOKEN='+CLOUDMADE_TOKEN);
}


function map_init() {
  $('#map').html('Get Your Position...');

  navigator.geolocation.getCurrentPosition(
    function(p) {
      var my_coords = new L.LatLng(p.coords.latitude, p.coords.longitude);

      var h = screen.height - parseInt($('#footer').css('height'));
      console.log('GPS Strike h='+h+' footer.css(height)='+$('#footer').css('height'));
      $('#map').css('height',h+'px');

      map = new L.Map('map', {
          center: my_coords,
					zoomControl: true,
					attributionControl: false,
          zoom: 13
      });

      map.on('click', function(e) {
				if (map_click) {
					map_click(e);
				}
		  });

		  $('.leaflet-control-zoom a').each( function(i,e) {
		  	e.style.width = iconWidth + 'px';
		  	e.style.height = iconWidth + 'px';
		  });


      var cloudmade = new L.TileLayer('http://{s}.tile.cloudmade.com/'+CLOUDMADE_API_KEY+'/'+CLOUDMADE_STYLE_ID+'/'+CLOUDMADE_TILE_SIZE+'/{z}/{x}/{y}.png?token='+CLOUDMADE_TOKEN, {maxZoom: 18});
      map.addLayer(cloudmade);


      PLAYERS[device.uuid] = {
      	login: window.localStorage.getItem('login'),
				coordinates: {
					lat: p.coords.latitude,
					lng: p.coords.longitude
				},
				marker: new L.Marker(my_coords,{icon: BluePlayerIcon })
      }
      map.addLayer(PLAYERS[device.uuid]['marker']);

    },
    geoLocationError,
    GET_CURRENT_COORDS
  );
}

function map_init_watch_my_geo() {
	navigator.geolocation.watchPosition(
		function(p) {
			var msg = {
				cmd:'coordinates',
				auth_k: CryptoJS.util.bytesToHex(CryptoJS.SHA1(device.uuid+window.localStorage.getItem('password'), { asBytes: true })),
				uuid: device.uuid,
				coordinates:{
					lat:p.coords.latitude,
					lng:p.coords.longitude
				}
			};
			PLAYERS[device.uuid]['coordinates'] = msg['coordinates'];
			map_set_player(PLAYERS[device.uuid],BluePlayerIcon);
			sock.sendJSON(msg);
		},
		geoLocationError,
		WATCH_CURRENT_COORDS
	);
}

function map_set_player(player,icon,popup) {
  var p = new L.LatLng(player['coordinates']['lat'], player['coordinates']['lng']);
	if (typeof player['marker'] == 'undefined') {
		player['marker'] = new L.Marker(p, {icon: icon });
		map.addLayer(player['marker']);
	} else {
		player['marker'].setLatLng(p);
		if (typeof icon != 'undefined') {
			player['marker'].setIcon(icon);
		}
	}
	if (!popup) {
		popup=player['login']+'<br>HP: '+player['health'];
	}

	if (player['health'] <= 0.0) {
		player['marker'].setIcon(DeadPlayerIcon);
	}

	player['marker'].bindPopup(popup);
}

function map_set_bounds(p1,p2, borderWidth) {
  var sw = map.latLngToLayerPoint( new L.LatLng(Math.min(p1.lat , p2.lat) , Math.min(p1.lng , p2.lng)) );
  var ne = map.latLngToLayerPoint( new L.LatLng(Math.max(p1.lat , p2.lat) , Math.max(p1.lng , p2.lng)) );

  sw = map.layerPointToLatLng(new L.Point(sw.x - borderWidth , sw.y - borderWidth) );
  ne = map.layerPointToLatLng(new L.Point(ne.x + borderWidth , ne.y + borderWidth) );

  map.fitBounds( new L.LatLngBounds(sw,ne) );
}

function map_set_disconnect_icon(show) {
	$('#DisconnectIcon').css('width',iconWidth+'px');
	$('#DisconnectIcon').css('height',iconWidth+'px');
	$('#DisconnectIcon').css('z-index',show ? '10':'0');
	$('#DisconnectIcon').css('display',show ? 'block':'none');
}
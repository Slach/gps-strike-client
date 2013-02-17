var map_click = null;
var next_click = null;
var done_click = null;
var confirm_click = null;
var cancel_click = null;


var slider = null;


function game_ui_slider() {
	if ($('#slider_bar').width() && !slider) {
		slider = new ZeptoSlider('slider_bar');
	}
}

function game_ui_refresh(showed) {
  var ui = ['status_bar','slider_bar','next_nav','done_nav','confirm_nav','toolbar_nav'];
  var k=0;
  var h=0;
  console.log('GPS Strike game_ui_refresh showed='+showed);
	for(k in ui) {
	  var e=$('#'+ui[k]);
	  if (showed==true) {
			e.show();
			h = h + e.height();
  	} else {
			e.hide();
	  }
	}
	for(s in showed) {
		for(k in ui) {
		  var e=$('#'+ui[k]);
			if (showed[s]==ui[k]) {
				e.css('display','block');
  			h = h + e.height();
			}
    }
  }

	$('#footer').height(h);
  $('#map').height(screen.height - $('#footer').height() );
  console.log('GPS-Strike: footer h='+h+' $(#map).height='+$('#map').height());
  game_ui_slider();
  map.invalidateSize();
}

function game_ui_reset() {
	map_click = null;
	next_click = null;
	done_click = null;
	confirm_click = null;
	cancel_click = null;

	if (EATTACK != null && typeof EATTACK[device.uuid] != 'undefined' && typeof EATTACK[device.uuid]['Sector'] != 'undefined') {
	  map.removeLayer(EATTACK[device.uuid]['Sector']);
	}

	if (MATTACK != null && typeof MATTACK[device.uuid] != 'undefined' && typeof MATTACK[device.uuid]['Circle'] != 'undefined') {
	  map.removeLayer(typeof MATTACK[device.uuid]['Circle']);
	}


}

$('#ConfirmBtn').on('click', function(e) {
	if (confirm_click) {
		confirm_click(e);
	}
});

$('#NextBtn').on('click', function(e) {
	if (next_click) {
		next_click(e);
	}
});

$('#DoneBtn').on('click', function(e) {
	if (done_click) {
		done_click(e);
	}
	game_ui_reset();
  game_ui_refresh(['toolbar_nav']);

	e.preventDefault();
	return false;
});


$('#CancelBtn').on('click', function(e) {
	if (cancel_click) {
		cancel_click(e);
	}

	game_ui_reset();
  game_ui_refresh(['toolbar_nav']);


	EATTACK[device.uuid] = {};
	MATTACK[device.uuid] = {};

	e.preventDefault();
	return false;
});




$('#HomeBtn').on('click', function(e) {
	console.log('GPS Strike #HomeBtn click event');
	var p=PLAYERS[device.uuid];
	if (p) {
		map.panTo(new L.LatLng(p['coordinates']['lat'],p['coordinates']['lng']));
	}
	e.preventDefault();
	return false;
});

$('#EAttackBtn').on('click', function(e) {
	game_ui_reset();
  EATTACK[device.uuid]={target: {}, angle:Math.round(GAME['energy_angle']*0.2), attack:0};

  $('#status_bar').html('Select target on map');
  game_ui_refresh(['status_bar']);
  map_click = function(e) {
    console.log('GPS Strike map_click e='+e);
    EATTACK[device.uuid]['target']={};
  	EATTACK[device.uuid]['target']['lat'] = e.latlng.lat;
  	EATTACK[device.uuid]['target']['lng'] = e.latlng.lng;

  	var player = PLAYERS[device.uuid];
  	var p = new L.LatLng(player['coordinates']['lat'], player['coordinates']['lng']);

  	if (typeof EATTACK[device.uuid]['Sector'] == 'undefined') {
     	EATTACK[device.uuid]['Sector'] = new L.Sector(p, e.latlng, 0, EAttackOptions);
     	map.addLayer(EATTACK[device.uuid]['Sector']);
    } else {
      EATTACK[device.uuid]['Sector'].setLatLng(p,e.latlng);
    }
		$('#status_bar').html('Target: '+e.latlng.lat.toFixed(3)+','+e.latlng.lng.toFixed(3));


		game_ui_refresh(['status_bar','slider_bar','next_nav']);

		var s_bounds = EATTACK[device.uuid]['Sector'].getBounds();
		s_bounds.extend(p);
	  map_set_bounds(s_bounds.getSouthWest(), s_bounds.getNorthEast(), iconWidth);

  	slider.callback = function(percent) {
  	  EATTACK[device.uuid]['angle'] = parseFloat(GAME['energy_angle'] * parseFloat(percent)/100);
  	  console.log('GPS Strike slider percent='+percent+' angle='+EATTACK[device.uuid]['angle']);
		  $('#status_bar').html('Angle: '+EATTACK[device.uuid]['angle']+'&deg;');
      EATTACK[device.uuid]['Sector'].setAngle(EATTACK[device.uuid]['angle']);

			var s_bounds = EATTACK[device.uuid]['Sector'].getBounds();
			s_bounds.extend(p);
		  map_set_bounds(s_bounds.getSouthWest(), s_bounds.getNorthEast(), iconWidth);

  	};

		if (typeof EATTACK[device.uuid]['angle'] != 'undefined') {
			slider.setPercentage(Math.round(100 * EATTACK[device.uuid]['angle']/GAME['energy_angle']));
		}

  	next_click = function(e) {

    	slider.callback = function(percent) {
    	  EATTACK[device.uuid]['attack'] = parseFloat(GAME['energy_attack'] * parseFloat(percent)/100);
  	    console.log('GPS Strike slider percent='+percent+' attack='+EATTACK[device.uuid]['attack']);
			  $('#status_bar').html('Power: '+EATTACK[device.uuid]['attack']);
    	};

			if (typeof EATTACK[device.uuid]['attack'] != 'undefined') {
				slider.setPercentage(Math.round(100 * EATTACK[device.uuid]['attack']/GAME['energy_attack']));
			}

    	confirm_click = function(e) {
    		var msg = {
					cmd:'energy_attack',
					uuid: device.uuid,
					auth_k: CryptoJS.util.bytesToHex(CryptoJS.SHA1(device.uuid+window.localStorage.getItem('password'), { asBytes: true }))
				}
				var a = ['target', 'angle', 'attack'];
				for(k in a) {
					msg[a[k]] = EATTACK[device.uuid][a[k]];
				}

				map_click=null;
				confirm_click=null;
				next_click=null;


				sock.sendJSON(msg);

				done_click = function(e) {
	     		game_ui_refresh(['toolbar_nav']);
				};

     		game_ui_refresh(['done_nav']);

				e.preventDefault();
				return false;
    	};

   		game_ui_refresh(['status_bar','confirm_nav','slider_bar']);

			e.preventDefault();
			return false;
  	};
  };

	e.preventDefault();
	return false;
});



$('#MAttackBtn').on('click', function(e) {
	game_ui_reset();
  MATTACK[device.uuid]={target: {}, radius:Math.round(GAME['mech_radius']*0.5), attack:0};

  $('#status_bar').html('Select target on map');
  game_ui_refresh(['status_bar']);
  map_click = function(e) {
    console.log('GPS Strike map_click e='+e);
    MATTACK[device.uuid]['target']={};
  	MATTACK[device.uuid]['target']['lat'] = e.latlng.lat;
  	MATTACK[device.uuid]['target']['lng'] = e.latlng.lng;

  	var player = PLAYERS[device.uuid];
  	var p = new L.LatLng(player['coordinates']['lat'], player['coordinates']['lng']);

  	if (typeof MATTACK[device.uuid]['Circle'] == 'undefined') {
     	MATTACK[device.uuid]['Circle'] = new L.Circle(e.latlng, 0, MAttackOptions);
     	map.addLayer(MATTACK[device.uuid]['Circle']);
    } else {
      MATTACK[device.uuid]['Circle'].setLatLng(e.latlng);
    }
		$('#status_bar').html('Target: '+e.latlng.lat.toFixed(3)+','+e.latlng.lng.toFixed(3));


		game_ui_refresh(['status_bar','slider_bar','next_nav']);

    var c_bounds = MATTACK[device.uuid]['Circle'].getBounds();
    c_bounds.extend(p);
    map_set_bounds(c_bounds.getSouthWest(),c_bounds.getNorthEast(),iconWidth);

  	slider.callback = function(percent) {
  	  MATTACK[device.uuid]['radius'] = parseInt(GAME['mech_radius'] * parseFloat(percent)/100);
  	  console.log('GPS Strike slider percent='+percent+' radius='+MATTACK[device.uuid]['radius']);
		  $('#status_bar').html('Radius: '+MATTACK[device.uuid]['radius']+' meters');
      MATTACK[device.uuid]['Circle'].setRadius(MATTACK[device.uuid]['radius']);

      var c_bounds = MATTACK[device.uuid]['Circle'].getBounds();
      c_bounds.extend(p);
      map_set_bounds(c_bounds.getSouthWest(),c_bounds.getNorthEast(),iconWidth);

  	};


		if (typeof MATTACK[device.uuid]['radius'] != 'undefined') {
			slider.setPercentage(Math.round(100 * MATTACK[device.uuid]['radius']/GAME['mech_radius']));
		}

  	next_click = function(e) {

    	slider.callback = function(percent) {
    	  MATTACK[device.uuid]['attack'] = parseFloat(GAME['mech_attack'] * parseFloat(percent)/100);
  	    console.log('GPS Strike slider percent='+percent+' attack='+MATTACK[device.uuid]['attack']);
			  $('#status_bar').html('Power: '+MATTACK[device.uuid]['attack']);
    	};

			if (typeof MATTACK[device.uuid]['attack'] != 'undefined') {
				slider.setPercentage(Math.round(100 * MATTACK[device.uuid]['attack']/GAME['mech_attack']));
			}

    	confirm_click = function(e) {
    		var msg = {
					cmd:'mech_attack',
					uuid: device.uuid,
					auth_k: CryptoJS.util.bytesToHex(CryptoJS.SHA1(device.uuid+window.localStorage.getItem('password'), { asBytes: true }))
				}
				var a = ['target', 'radius', 'attack'];
				for(k in a) {
					msg[a[k]] = MATTACK[device.uuid][a[k]];
				}

				map_click=null;
				confirm_click=null;
				next_click=null;


				sock.sendJSON(msg);

				done_click = function(e) {
	     		game_ui_refresh(['toolbar_nav']);
				};

     		game_ui_refresh(['done_nav']);

				e.preventDefault();
				return false;
    	};

   		game_ui_refresh(['status_bar','confirm_nav','slider_bar']);

			e.preventDefault();
			return false;
  	};
  };

	e.preventDefault();
	return false;
});

var GAME = {};
var PLAYERS = {};

var EATTACK = {};
var MATTACK = {};


var cmd_list = {
	'game': function (msg) {
		for(k in msg['game']) {
			GAME[k]=msg['game'][k];
		}

		if (typeof GAME['marker'] == 'undefined') {
			GAME['marker'] = new L.Circle(new L.LatLng(GAME['latitude'], GAME['longitude']), GAME['radius'], {color: '#050', clickable: false, fillOpacity: 0.15	});
			map.addLayer(GAME['marker']);
		} else {
			GAME['marker'].setLatLng(new L.LatLng(GAME['latitude'], GAME['longitude']));
			GAME['marker'].setRadius(GAME['radius']);
		}

		for(i in msg['players']) {
			var p = msg['players'][i];

			if (typeof PLAYERS[p['uuid']] == 'undefined') {
				PLAYERS[p['uuid']] = {};
			}

			PLAYERS[p['uuid']]['login'] = p['login'];
			PLAYERS[p['uuid']]['health'] = p['health'];
			PLAYERS[p['uuid']]['coordinates'] = p['coordinates'];
			map_set_player(PLAYERS[p['uuid']],p['uuid'] != device.uuid ? RedPlayerIcon : BluePlayerIcon);
		}

  },

	'connect': function(msg) {
		if (typeof PLAYERS[msg['uuid']] == 'undefined') {
			PLAYERS[msg['uuid']] = {};
		}
		PLAYERS[msg['uuid']]['login'] = msg['login'];
		PLAYERS[msg['uuid']]['health'] = msg['health'];
		cmd_list['coordinates'](msg);
	},

	'coordinates': function(msg) {
		PLAYERS[msg['uuid']]['coordinates'] = msg['coordinates'];
		map_set_player(PLAYERS[msg['uuid']],RedPlayerIcon);
  },

  'energy_attack': function(msg) {
  	var player = PLAYERS[msg['uuid']];
  	var me     = PLAYERS[device.uuid];
  	var p1=new L.LatLng(player['coordinates']['lat'],player['coordinates']['lng']);
  	var p2=new L.LatLng(msg['target']['lat'],msg['target']['lng']);
  	var p3=new L.LatLng(me['coordinates']['lat'],me['coordinates']['lng']);

		if (typeof EATTACK[msg['uuid']] == 'undefined') {
        EATTACK[msg['uuid']]={target: {}, angle:0, attack:0};
		}

    EATTACK[msg['uuid']]['target'] = msg['target'];
    EATTACK[msg['uuid']]['angle']  = msg['angle'];
		EATTACK[msg['uuid']]['damaged_players']= msg['damaged_players'];

  	if (typeof EATTACK[msg['uuid']]['Sector'] == 'undefined') {
   		EATTACK[msg['uuid']]['Sector'] = new L.Sector(p1, p2, msg['angle'], EAttackOptions);
  		map.addLayer(EATTACK[msg['uuid']]['Sector']);
    } else {
    	EATTACK[msg['uuid']]['Sector'].setLatLng(p1,p2);
    	EATTACK[msg['uuid']]['Sector'].setAngle(msg['angle']);
    }


    var sw=new L.LatLng(Math.min(p1.lat,p2.lat,p3.lat), Math.min(p1.lng,p2.lng,p3.lng));
    var ne=new L.LatLng(Math.max(p1.lat,p2.lat,p3.lat), Math.max(p1.lng,p2.lng,p3.lng));

  	for(var k in msg['damaged_players']) {
  		d_player = msg['damaged_players'][k];

  		sw = new L.LatLng(Math.min(sw.lat,PLAYERS[d_player['uuid']]['coordinates']['lat']), Math.min(sw.lng,PLAYERS[d_player['uuid']]['coordinates']['lng']));
  		ne = new L.LatLng(Math.max(ne.lat,PLAYERS[d_player['uuid']]['coordinates']['lat']), Math.max(ne.lng,PLAYERS[d_player['uuid']]['coordinates']['lng']));
    }

	  map_set_bounds(sw, ne, iconWidth);


  	PLAYERS[msg['uuid']]['energy'] = parseFloat(PLAYERS[msg['uuid']]['energy']) - parseFloat(msg['energy']);
  	if (PLAYERS[msg['uuid']]['energy'] < 0.0) PLAYERS[msg['uuid']]['energy'] = 0;

  	for(var k in msg['damaged_players']) {
  		d_player = msg['damaged_players'][k];
  		PLAYERS[d_player['uuid']]['health'] = d_player['health'];

  		PLAYERS[d_player['uuid']]['marker'].bindPopup(PLAYERS[d_player['uuid']]['login']+'<br>D: -'+d_player['damage']+' HP: '+d_player['health']);
  		PLAYERS[d_player['uuid']]['marker'].openPopup();
  	}

  	done_click = function(e) {
			for(var uuid in EATTACK) {
				var eattack = EATTACK[uuid];
				if (typeof eattack['Sector'] != 'undefined') {
				  map.removeLayer(eattack['Sector']);
				}
      	for(var k in eattack['damaged_players']) {
      		d_player = eattack['damaged_players'][k];
      		PLAYERS[d_player['uuid']]['marker'].closePopup();
      		PLAYERS[d_player['uuid']]['marker'].bindPopup(PLAYERS[d_player['uuid']]['login']+'<br>HP: '+PLAYERS[d_player['uuid']]['health']);
      	}
        EATTACK[uuid]={target: {}, angle:0, attack:0};
      }
    	game_ui_reset();
  		game_ui_refresh(['toolbar_nav']);

			e.preventDefault();
			return false;
  	};

  	game_ui_refresh(['done_nav']);

  },

  'mech_attack': function(msg) {
  	var player = PLAYERS[msg['uuid']];
  	var me     = PLAYERS[device.uuid];
  	var p1=new L.LatLng(player['coordinates']['lat'],player['coordinates']['lng']);
  	var p2=new L.LatLng(msg['target']['lat'],msg['target']['lng']);
  	var p3=new L.LatLng(me['coordinates']['lat'],me['coordinates']['lng']);

		if (typeof MATTACK[msg['uuid']] == 'undefined') {
        MATTACK[msg['uuid']]={target: {}, radius:0, attack:0};
		}

    MATTACK[msg['uuid']]['target'] = msg['target'];
    MATTACK[msg['uuid']]['radius']  = msg['radius'];
		MATTACK[msg['uuid']]['damaged_players']= msg['damaged_players'];

  	if (typeof MATTACK[msg['uuid']]['Circle'] == 'undefined') {
   		MATTACK[msg['uuid']]['Circle'] = new L.Circle(p2, msg['radius'], MAttackOptions);
  		map.addLayer(MATTACK[msg['uuid']]['Circle']);
    } else {
    	MATTACK[msg['uuid']]['Circle'].setLatLng(p2);
    	MATTACK[msg['uuid']]['Circle'].setRadius(msg['radius']);
    }


    var sw=new L.LatLng(Math.min(p1.lat,p2.lat,p3.lat), Math.min(p1.lng,p2.lng,p3.lng));
    var ne=new L.LatLng(Math.max(p1.lat,p2.lat,p3.lat), Math.max(p1.lng,p2.lng,p3.lng));

  	for(var k in msg['damaged_players']) {
  		d_player = msg['damaged_players'][k];

  		sw = new L.LatLng(Math.min(sw.lat,PLAYERS[d_player['uuid']]['coordinates']['lat']), Math.min(sw.lng,PLAYERS[d_player['uuid']]['coordinates']['lng']));
  		ne = new L.LatLng(Math.max(ne.lat,PLAYERS[d_player['uuid']]['coordinates']['lat']), Math.max(ne.lng,PLAYERS[d_player['uuid']]['coordinates']['lng']));
    }

	  map_set_bounds(sw, ne, iconWidth);


  	PLAYERS[msg['uuid']]['energy'] = parseFloat(PLAYERS[msg['uuid']]['energy']) - parseFloat(msg['energy']);
  	if (PLAYERS[msg['uuid']]['energy'] < 0.0) PLAYERS[msg['uuid']]['energy'] = 0;

  	for(var k in msg['damaged_players']) {
  		d_player = msg['damaged_players'][k];
  		PLAYERS[d_player['uuid']]['health'] = d_player['health'];

  		PLAYERS[d_player['uuid']]['marker'].bindPopup(PLAYERS[d_player['uuid']]['login']+'<br>D: -'+d_player['damage']+' HP: '+d_player['health']);
  		PLAYERS[d_player['uuid']]['marker'].openPopup();
  	}

  	done_click = function(e) {
			for(var uuid in MATTACK) {
				var mattack = MATTACK[uuid];
				if (typeof mattack['Circle'] != 'undefined') {
				  map.removeLayer(mattack['Circle']);
				}
      	for(var k in mattack['damaged_players']) {
      		d_player = mattack['damaged_players'][k];
      		PLAYERS[d_player['uuid']]['marker'].closePopup();
      		PLAYERS[d_player['uuid']]['marker'].bindPopup(PLAYERS[d_player['uuid']]['login']+'<br>HP: '+PLAYERS[d_player['uuid']]['health']);
      	}
        MATTACK[uuid]={target: {}, radius:0, attack:0};
      }
    	game_ui_reset();
  		game_ui_refresh(['toolbar_nav']);

			e.preventDefault();
			return false;
  	};

  	game_ui_refresh(['done_nav']);

  },
};

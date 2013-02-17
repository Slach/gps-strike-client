var sock = null;
var send_connect=false;

function net_init_sockjs() {
  sock = new SockJS('http://'+window.localStorage.getItem('server')+'/server',null,{'protocols_whitelist':['websocket','xhr-streaming','xhr-pooling','iframe-xhr-polling']});
  sock.onopen = function() {
		console.log('GPS Strike sockjs connection open');
    msg = {
			login: window.localStorage.getItem('login'),
			uuid: device.uuid,
			auth_k: CryptoJS.util.bytesToHex(CryptoJS.SHA1(device.uuid+window.localStorage.getItem('password'), { asBytes: true })),
			coordinates: PLAYERS[device.uuid]['coordinates']
    };
		msg['cmd'] = send_connect==false ? 'connect' : 'coordinates';

    sock.sendJSON(msg);
		send_connect=true;
		map_set_disconnect_icon(false);
  };
//todo show "connectig..."
  sock.onclose = function() {
  	console.log('GPS Strike sockjs connection closed, try reconnect in '+RECONNECT_TIMEOUT+'ms');
		send_connect=false;
		map_set_disconnect_icon(true);
		setTimeout(net_init_sockjs,RECONNECT_TIMEOUT);
	};

  sock.onmessage = function(e) {
		console.log('GPS Strike receive msg='+e.data);
		msg=JSON.parse(e.data);
		if (typeof msg['cmd'] != 'undefined' && typeof cmd_list[msg['cmd']] != 'undefined') {
			cmd_list[msg['cmd']](msg);
		} else if (typeof msg['error'] != 'undefined') {
			switch (msg['error']['code']) {
				case 0:
				case 1:
				case 2:
			  	navigator.notification.alert(msg['error']['message']);
				  send_connect=false;
				  sock.close();
					break;
			  default:
			  	navigator.notification.alert(msg['error']['message']);
					break;

			}
		} else {
			console.log('GPS Strike sockjs ERROR Parsing message'+e.data);
		}

  };

  sock.sendJSON = function(msg) {
		msg = JSON.stringify(msg);
		console.log('GPS Strike send msg='+msg);
		sock.send(msg);
  };

}

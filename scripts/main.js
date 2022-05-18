(function() {
	'use strict';

	var initialized = false;
	var i18n;

	// i18n key prefix for MUC ("muc.") or 1:1 chat ("chat.")
	var key_prefix;
	var display_data = null;

	function show_clients(client_array) {
		var list = document.getElementById('client_list');
		for (var id = 0; id < client_array.length; id++) {
			var item = document.createElement('span');
			item.innerHTML = client_array[id];
			list.appendChild(item);
		}
	}

	function load_clients(url) {
		var request = new XMLHttpRequest();
		request.open('GET', url);
		request.onreadystatechange = function () {
			if (request.readyState === 4) {
				if (request.status === 200 || (isLocalFileRequest(url) && request.responseText.length > 0)) {
					show_clients(JSON.parse(request.responseText));
				}
			}
		};
		request.send(null);
	}

	function load_hash() {
		var muc = false;
		key_prefix = "chat.";
		var xmpp_uri = window.location.search || window.location.hash;
		xmpp_uri = decodeURIComponent(xmpp_uri.substring(xmpp_uri.indexOf('#') + 1, xmpp_uri.length));
		try {
			base_decoded = window.atob(xmpp_uri);
			if (base_decoded.search('@') >= 0)
				xmpp_uri = base_decoded;
		} catch (err) {
			// ignore error, JID wasn't base64 encoded
		}
		if (xmpp_uri.search("\\?join") >= 0) {
			muc = true;
			key_prefix = "muc.";
		}

		// TODO: proper error checking / display / Creation of invitations
		if (xmpp_uri.search("@") <= 0) return {xmpp_uri:xmpp_uri, xmpp_uri_encoded:xmpp_uri, name: xmpp_uri};

		var xmpp_params = {};
		var name = xmpp_uri.split("@")[0];
		xmpp_params["name"] = name.charAt(0).toUpperCase() + name.slice(1);

		var xmpp_uri_parts = xmpp_uri.split("?");

		if (xmpp_uri_parts.length > 1) {
			let parameter, parameters = xmpp_uri_parts[1].split(";")
			for (parameter of parameters) {
				let key_value = parameter.split("=")
				xmpp_params[key_value[0]] = key_value.length > 1 ? key_value[1] : "";
			}
		}

		xmpp_uri_parts[0] = encodeURIComponent(xmpp_uri_parts[0]) // URL-encode the JID only
		var xmpp_uri_encoded = xmpp_uri_parts.join("?");

		return {xmpp_uri: xmpp_uri, xmpp_uri_encoded: xmpp_uri_encoded, name: xmpp_params["name"]};
	}

	function translate_ui() {
		// translation
		document.title = i18n.text(key_prefix + 'title',  display_data);
		// MUC/chat specific
		['heading', 'button'].forEach(function(id) {
			document.getElementById(id).innerHTML = i18n.text(key_prefix + id, display_data);
		});
		// and agnostic
		['clients', 'recommend', 'checkfulllist', 'xmppis'].forEach(function(id) {
			document.getElementById(id).innerHTML = i18n.text(id, display_data);
		});
	}

	function rehash() {
		display_data = load_hash();
		document.getElementById('button').href = "xmpp:" + display_data.xmpp_uri_encoded;
		document.getElementById('url_in').value = "xmpp:" + display_data.xmpp_uri;
		translate_ui();
	}

	function createQR() {
		display_data = load_hash();
		new QRCode(document.getElementById("qrcode"), "xmpp:" + display_data.xmpp_uri);
	}

	function load_done() {
		if (initialized) return;
		initialized = true;

		// load i18n and perform translation
		i18n = new I18nText({path: 'lang'});
		i18n.once(I18nText.event.LOCALE_CHANGE, function (data) {
			rehash();
		});

		var preferredLocale, setLocale = false;
		for (preferredLocale of navigator.languages) {
			if (supportedLocales.includes(preferredLocale)) {
				i18n.setLocale(preferredLocale);
				setLocale = true;
				break;
			}
		}
		if (!setLocale) {
			i18n.setLocale(defaultLocale);
		}


		// functionality
		var ua = navigator.userAgent;
		switch (true) {
			case (ua.indexOf("Windows") >= 0):
				load_clients("clients_Windows.json")
			break;
			case (ua.indexOf("Android") >= 0):
			case (ua.indexOf("CrOS") >= 0):
				load_clients("clients_Android.json")
				createQR();
			break;
			case (ua.indexOf("iPad") >= 0):
			case (ua.indexOf("iPhone") >= 0):
				load_clients("clients_iOS.json")
				createQR();
			break;
			case (ua.indexOf("Mac OS X") >= 0):
			case (ua.indexOf("Macintosh") >= 0):
				load_clients("clients_OSX.json")
			break;
			case (ua.indexOf("Tizen") >= 0):
				load_clients("clients_Tizen.json")
				createQR();
			break;
			// just default
			case (true):
			case (ua.indexOf("Linux") >= 0):
				load_clients("clients_Linux.json");
				createQR();
			break;
		}

		window.addEventListener("hashchange", rehash, false);
		document.getElementById("url_in").addEventListener("focus", function(event) {
			event.target.select();
		});
	}

	// Wait for the DOM to be ready
	document.addEventListener('DOMContentLoaded', load_done, false);
	document.onreadystatechange = function() {
		if (document.readyState === 'interactive') {
			load_done();
		}
	};
	
	var logo = document.createElement('img');
	logo.src = 'assets/xmpp.svg';
	logo.alt= 'XMPP logo';
	logo.width = 60;
	
	var link = document.createElement('a');
	link.href = 'https://xmpp.org/';
	link.append(logo)
	
	var brand = document.getElementById('xmpp');
	brand.append(link)
})();

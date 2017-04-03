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
			var item = document.createElement('li');
			item.innerHTML = client_array[id];
			list.appendChild(item);
		}
	}

	function load_clients() {
		var url = "clients.json";
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
		var jid = window.location.search || window.location.hash;
		jid = decodeURIComponent(jid.substring(jid.indexOf('#') + 1, jid.length));
		try {
			base_decoded = window.atob(jid);
			if (base_decoded.search('@') >= 0)
				jid = base_decoded;
		} catch (err) {
			// ignore error, JID wasn't base64 encoded
		}
		if (jid.search("\\?join") >= 0) {
			muc = true;
			key_prefix = "muc.";
		}

		// TODO: proper error checking / display / Creation of invitations
		if (jid.search("@") <= 0) return {jid:"", name: "Somebody"};

		var name = jid.split("@")[0];
		name = name.charAt(0).toUpperCase() + name.slice(1);

		var jid_parts = jid.split("?");
		jid_parts[0] = encodeURIComponent(jid_parts[0]) // URL-encode the JID only
		var jid_encoded = jid_parts.join("?");

		return {jid: jid, jid_encoded: jid_encoded, name: name};
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
		document.getElementById('button').href = "xmpp:" + display_data.jid_encoded;
		document.getElementById('url_in').value = "xmpp:" + display_data.jid;
		translate_ui();
	}

	function load_done() {
		if (initialized) return;
		initialized = true;

		// load i18n and perform translation
		i18n = new I18nText({path: 'lang'});
		i18n.once(I18nText.event.LOCALE_CHANGE, function (data) {
			rehash();
		});
		i18n.setLocale('en');

		// functionality
		load_clients();
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
})();

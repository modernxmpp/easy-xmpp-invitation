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
			var item = document.createElement('div');
			/* innerHTML needed for client links */
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
		key_prefix = "chat";
		var xmpp_uri = window.location.search || window.location.hash;
		xmpp_uri = decodeURIComponent(xmpp_uri.substring(xmpp_uri.indexOf('#') + 1, xmpp_uri.length));
		if (xmpp_uri.indexOf("xmpp:") === 0) {
			xmpp_uri = xmpp_uri.slice(5);
		}
		try {
			base_decoded = window.atob(xmpp_uri);
			if (base_decoded.search('@') >= 0)
				xmpp_uri = base_decoded;
		} catch (err) {
			// ignore error, JID wasn't base64 encoded
		}
		if (xmpp_uri.search("\\?join") >= 0) {
			key_prefix = "muc";
		} else if(xmpp_uri.search("\\?register") >= 0) {
			key_prefix = "register";
		}

		// TODO: proper error checking / display / Creation of invitations
		if (xmpp_uri.search("@") <= 0) return {xmpp_uri:xmpp_uri, xmpp_uri_encoded:xmpp_uri, name: xmpp_uri.split("?")[0]};

		var xmpp_params = {};

		var xmpp_uri_parts = xmpp_uri.split("?");

		if (xmpp_uri_parts.length > 1) {
			let parameter, parameters = xmpp_uri_parts[1].split(";")
			for (parameter of parameters) {
				let key_value = parameter.split("=")
				xmpp_params[key_value[0]] = key_value.length > 1 ? key_value[1] : "";
			}
		}

		const jid_parts = xmpp_uri_parts[0].split("@");

		const local_part = jid_parts[0];
		xmpp_params["name"] = local_part.charAt(0).toUpperCase() + local_part.slice(1);

		const domain_part = jid_parts[1];

		const jid_encoded = encodeURIComponent(local_part) + "@" + encodeURIComponent(domain_part)
		xmpp_uri_parts[0] = jid_encoded
		const xmpp_uri_encoded = xmpp_uri_parts.join("?")

		return {xmpp_uri: xmpp_uri, xmpp_uri_encoded: xmpp_uri_encoded, name: xmpp_params["name"]};
	}

	let fallbackLocale = "en";
	let requested_fallback_locale = false;

	function get_translated_string(key, data) {
		return new Promise(function (resolve, reject) {
			try {
				return resolve(i18n.text(key, data));
			} catch {
				if(i18n.hasLocale(fallbackLocale)) {
					return resolve(i18n.text(key, data, fallbackLocale));
				}
				i18n.once(I18nText.event.LOCALE_LOAD, function () {
					try {
						return resolve(i18n.text(key, data, fallbackLocale));
					} catch {
						return resolve("UNTRANSLATED[" + key + "]");
					}
				});
				if(!requested_fallback_locale) {
					i18n.loadLocale(fallbackLocale);
					requested_fallback_locale = true;
				}
			}
		});
	}

	function translate_ui() {
		// translation
		get_translated_string(key_prefix + '.title',  display_data).then(function (text) {
			document.title = text;
		});

		let translatable_els = document.querySelectorAll("[data-i18n]");

		translatable_els.forEach(function (el) {
			let key = el.dataset.i18n;
			if(key.startsWith(".")) {
				key = key_prefix + key;
			}
			get_translated_string(key, display_data).then(function (text) {
				let target = el.dataset.i18nTarget || "innerText";
				if(target.startsWith("@")) {
					el.setAttribute(target.substr(1), text);
				} else {
					el[target] = text;
				}
			});
		});
	}

	function rehash() {
		let hash = window.location.search || window.location.hash;
		if(!hash || hash == "#") {
			// Input mode
			document.getElementById("display-uri").style.display = "none";
			document.getElementById("enter-uri").style.display = "block";
			initialize_uri_input();
			key_prefix = "create";
		} else {
			document.getElementById("display-uri").style.display = "block";
			document.getElementById("enter-uri").style.display = "none";

			display_data = load_hash();
			document.getElementById('button').href = "xmpp:" + display_data.xmpp_uri_encoded;
			document.getElementById('url_in').value = "xmpp:" + display_data.xmpp_uri;
		}
		translate_ui();
	}

	function createQR() {
		display_data = load_hash();
		new QRCode(document.getElementById("qrcode"), "xmpp:" + display_data.xmpp_uri_encoded);
	}

	function generate_link() {
		let input_el = document.getElementById("uri_input");
		let output_el = document.getElementById("generated-link");
		let is_muc_el = document.getElementById("is_muc");

		let input = input_el.value;
		var uri;

		if(!(input.indexOf("xmpp:") == 0)) {
			uri = "xmpp:" + input;
			if(is_muc_el.checked) {
				uri += "?join";
			}
			is_muc_el.disabled = false;
		} else {
			uri = decodeURIComponent(input);
			is_muc_el.disabled = true;
			is_muc_el.checked = uri.endsWith("?join");
		}

		let encoded_uri = uri.substr(5).split("@").map(encodeURIComponent).join("@");

		let link = document.location.origin + document.location.pathname + "#" + encoded_uri;
		output_el.href = link;
		output_el.innerText = link;
	}

	function copy_to_clipboard() {
		let link = document.getElementById("generated-link");
		let copy_result_el = document.getElementById("copy-result");
		Promise.resolve().then(function () {
			return navigator.clipboard.writeText(link.href);
		}).then(function () {
			copy_result_el.innerText = i18n.text("copy-success");
		}, function () {
			copy_result_el.innerText = i18n.text("copy-failure");
		}).finally(function () {
			copy_result_el.style.visibility = "visible";
		});
	}

	function initialize_uri_input() {
		document.getElementById("generate-link-btn").addEventListener("click", function () {
			generate_link();
			document.getElementById("display-link").style.display = "block";
		});
		document.getElementById("uri_input").addEventListener("input", generate_link);
		document.getElementById("is_muc").addEventListener("change", generate_link);
		document.getElementById("copy-link").addEventListener("click", copy_to_clipboard);
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
		var rtlLangs = "ar, fa, he, ur"
		if (rtlLangs.includes(navigator.language)) {
			document.querySelector("body").dir = "rtl";
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

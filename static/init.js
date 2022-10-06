var VAMD = (function () {
	var self = {};
	
	self.loaderConfig = {

		appRoot: '//va.myer.com.au/myer_live_ui', // set app location
		// appRoot: '//3.104.8.151/myer_staging_ui', // set app location
		version: 0,
	};
	
	self.injectVA = function(data) {
		var fileVersion = data.ver;
		var vascript = document.createElement('script');
		self.loaderConfig.version = data.ver;
		
		vascript.setAttribute('src', self.loaderConfig.appRoot + '/va.js?v=' + fileVersion);	
		var wrapper = document.getElementById('virtual-assistant');
		
		if(typeof(wrapper) !== 'undefined' && wrapper !== null) {
			document.getElementById('virtual-assistant').appendChild(vascript);
		}
		else {
			self.createWrapper(function() {
				document.getElementById('virtual-assistant').appendChild(vascript);
			});
		}
	};
	
	self.createWrapper = function(callback) {
		var vadiv = document.createElement("div");
		vadiv.id = "virtual-assistant";
		document.body.appendChild(vadiv);
		callback && callback();
	};

	self.getVersions = (function(){
		return function(url, callback, context) {
			var name = "cvversion";
			url += "?callback=" + name + '&v=' + Math.round(+new Date()/1000);

			// Create script
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = url;

			// Setup handler
			window[name] = function(data){
			  callback.call((context || window), data);
			  document.getElementsByTagName('head')[0].removeChild(script);
			  script = null;
			  delete window[name];
			};

			// Load JSON
			document.getElementsByTagName('head')[0].appendChild(script);
		};
	})();	
	
	return self;
}());

if(document.readyState == 'complete') {
	VAMD.getVersions(VAMD.loaderConfig.appRoot + '/ver.js', function(data) {
		VAMD.injectVA(data);
	});	
}
else {
	
	document.onreadystatechange = function() {
		if(document.readyState === 'complete') {
			VAMD.getVersions(VAMD.loaderConfig.appRoot + '/ver.js', function(data) {
				VAMD.injectVA(data);
			});
		}
	};
	
	/*
	if(document.addEventListener) {
		document.addEventListener("DOMContentLoaded", function() {
			document.removeEventListener( "DOMContentLoaded", arguments.callee, false);
				VAMD.getVersions(VAMD.loaderConfig.appRoot + '/ver.js', function(data) {
					VAMD.injectVA(data);
				});	
		}, false);
	}
	else if(document.attachEvent) { // IE
		// ensure firing before onload
		document.attachEvent("onreadystatechange", function() {
			if(document.readyState === "complete") {
				document.detachEvent("onreadystatechange", arguments.callee);
					VAMD.getVersions(VAMD.loaderConfig.appRoot + '/ver.js', function(data) {
						VAMD.injectVA(data);
					});	
			}
		});
	}
	*/
}

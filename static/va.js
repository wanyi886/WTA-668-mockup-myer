"use strict";

var cvjq;
(function (self) {
	self.conf = {
		projectName: 'Creative Virtual',
		template: '<div class=va-trigger-pod><div class=va-trigger role=button aria-label="click here to toggle the virtual assistant"tabindex=0 title="Click here to toggle the virtual assistant">Need help?</div></div><div class=va-wrap><div class=va-header-wrap><div class="clearfix va-header"><a class=va-logo href=https://www.creativevirtual.com title="Creative Virtual"target=_blank>Creative Virtual</a> <a class=va-close href=javascript:void(0) title="Close the virtual assistant"arial-label="Close the virtual assistant"role=button>Close the virtual assistant</a></div></div><div class=va-body-wrap><div class=va-body><div class=va-content role=status aria-live=polite></div></div><div class=va-inp><div class=va-inp-in><div class=va-txt-pod><input autocomplete=off class=va-inp-txt id=entry name=entry placeholder="Enter your question"tabindex=0></div><div class=va-btn-pod><button class=va-inp-btn tabindex=0 name=send type=submit>Ask</button></div></div><div class=va-autocomplete></div></div><div class="livechat_button"><a class="va-cta-link" href="javascript:void(0)" title="" onclick="VAMD.lc.offerLiveChat()">Start live chat</a></div><div class=va-related aria-live=polite><button class="va-related-head va-toggle"tabindex=0 arial-label="View related questions and categories">Related Questions</button><div class=va-related-pod><div class=va-related-nav><div class="clearfix va-breadcrumbs"></div><div class=va-dropdown></div></div><div class=va-faqs role=status></div></div></div></div><div class=va-footer-wrap></div><div class=va-loading style=display:none><div class=va-cssload-square><div class="va-cssload-square-part va-cssload-square-color1"></div><div class="va-cssload-square-part va-cssload-square-color2"></div><div class=va-cssload-square-blend></div></div></div></div>',																					// Inline template variable
		resourceURI: self.loaderConfig.appRoot,													// Folder on the server containing all the VA's resources: JS, CSS and images
		
		// resourceURI: '//myer.aus.apac.creativevirtual.com/myer_staging_ui/',

		scripts: ['jquery-3.6.0.min.js', 'main.css', 'main.js', 'purecloud-guest-chat-client.min.js' ,'pcc.module.js'/*,'lc.module.js'*/], 			// jQuery must be the first file in array
		vaurl: '//va.myer.com.au/myer_live' + '/bot.htm?api=1&type=json',											// Virtual Assistant end-point - help73.creativevirtual.com

		// vaurl: '//3.104.8.151/myer_staging' + '/bot.htm?api=1&type=json',
		peUrl: 'http://localhost/PersonalisationEngine',
		loadJQ: true,																		// Do we load our own version of jQuery? If this is set to false AND parent page doesn't have JQ, script will ignore this setting
		candidateCollectionCompute: false,													// Mainly for DL (set value true), to add source into engine request and for candidate collection compute
		component: {																		// Available components
			autocomplete: true,
			livechat: false,
			sso: false,
			faqs: true,
			pureCloudChat: true
		},
		autocompleteURI: '//va.myer.com.au/myer_live' + '/bot.htm?JSIN=1',													// Autocomplete URI
		// autocompleteURI: '//3.104.8.151/myer_staging' + '/bot.htm?api=1&type=json',
		debug: true,		 																// Enable data output in browser console
		production: false, 																	// Is this VA live? If so inline template variable will be used, otherwise template.cv.html
		version: '1.0.0',																	// VA version number
		history: true,																		// Are we preserving VA chat history?
		autonav: false,																		// Autonavigation if autonav node is populated with a link
		superplaceholder: { 																// Ghosh type in sugestions for the user in the input area (text gets typed in with a small delay)		
			enable: false,																	// Enable/Disable the superplaceholder
			default_sentences: ['Enter your quetion here...'],								// Sentences to be displayed
			instance_sentences: [],
			include_FAQ: true,																// Add the current FAQs to the list of sentences displayed in the superplaceholder
			instance: false																// This is the instance of the placeholder that will be run. call .start(), .stop() or .desrtoy() to interact with it.
		},
		va: { 																				// VA request data
			businessArea: 'Root',
			Channel: 'Root.Website',
			startContext: ''
		},
		mobChannel: {
			enable: false, 																	// Is mob channel enabled? If enabled VA will append mob channel when below the threshold
			name: 'Root.Mobile'																// Mobile channel name to be used
		},
		templateType: {
			type: 'corner', 																// Template type, can be 'slideout', 'modal' or 'corner'
			position: '', 																	// TODO
			popup: false																	// Set to true if VA is being rendered as a popup window
		},
		threshold: 599, 																	// Width at which point VA is considered in mobile view
		convScroll: true,																	// True - Continuous conversation, False - Single question and answer
		loading: {
			auto: true, 																	// Main init function to be executed automatically or manually.
			autoshow: false																	// Do we automatically launch the VA based on where user has left off
			//type: 'ontrigger'
		},
		globalConfig: false,																// Is global configuration present? "va_config" object should be used for that purpose
		state: { 																			// Various state flags, DO NOT modify
			typing: false, 																	// Is text still being typed
			active: false, 																	// Is VA currently visible
			loaded: false, 																	// Was init response received
			ls: 1, 																			// Load scripts: 1 - VA, 2 - LC
			mode: 1,																		// Currently active mode: 1 - VA, 2 - LC
			enabled: true,																	// Is sending requests to the engine enabled? If false, Ajax requests to the engine will not be sent
			auth: false,
			ident: '',
			tabState: ''
		},
		clientConfig: "window.cv_config",													// Object provided by client containing options (for example, if to start VA or livechat)
		showLCButton: false,																	// Show or hides the Start live chat button // might be overwritten by self.conf.clientConfig.showLCButton
		availChecks : {
			startAvailChecks: "",														// immediately: Start avail checks on va.js load; open: start on trigger click and continue; once: do one check on trigger click 
			changeButtonVisibility: false,													// change or hide button if agents are not available -- NOT RECOMMENDED
			/*changeTriggerVisibility: false,*/													// change or hide the trigger button
			showAvailableAgents: true,														// show in the button text how many agents are available
			availChecks_queueId: 1,															// default queue id for avail checks
			check_interval: 2000,															// interval for avail checks, in ms
			check_exponent: 1.2                                                             // exponent for the exponential back off, see: TECH-4369
		},
		triggerText:{
			va: "Need help?",
			lc: "Livechat"
		},
		ccspLiveChat: "0",
		csspLiveChatURL: "https://aps-1.cxcloud.com.au/scripts/ChatExtension.dll",
		msg: {}																				// TODO - Various strings and messages
	};	

	self.init = function() {
		
		
		self.conf.debug && console.log('[VA-INFO] Init has been executed');

		self.loadScripts(self.conf.scripts, function() {
			// Executing main event listeners
			self.events(cvjq);
			
			// Enabling ICS
			self.ics.init(cvjq);
			
			// Enabling myerone and gift card
			self.myerone.init(cvjq);
			self.myerGiftCard.init(cvjq);
			
			// Enabling CV VA Hide
			self.CVHideVAWindow.init(cvjq);
			
			//document.getElementById('virtual-assistant').setAttribute('style', 'opacity:1');
			
			// Is autocomplete enabled
			self.conf.component.autocomplete && self.autocomplete.init(cvjq);
			
			// Is live chat enabled
			self.conf.component.livechat && self.lc.init(cvjq);
			
			// Is SSO enabled
			self.conf.component.sso && self.sso.init(cvjq);
			
			// Is Genesys Chat enabled
			self.conf.component.pureCloudChat && self.pcc.init(cvjq);
			
			// Any other preparation steps
			self.conf.state.localStorage = VAMD.util.checkStorage();

			if(self.conf.clientConfig)
				self.conf.clientConfig = eval(self.conf.clientConfig)
			if(self.conf.clientConfig == undefined) //in case the client config is not present, we default to enable_va to true
				self.conf.clientConfig = {enable_va:true}
			
			if(self.conf.clientConfig && self.conf.clientConfig.enable_livechat == true) {
				self.conf.state.mode = 2
			}
			
			self.conf.state.lc_button = 'hide_lc_button';
			if(self.conf.showLCButton || (self.conf.clientConfig && self.conf.clientConfig.showLCButton == true)){
				self.conf.state.lc_button = 'show_lc_button'
			}
			
			// Loading and injecting the template
			loadTemplate(cvjq, function() {
				self.renderTemplate(cvjq);
				self.renderTemplate(cvjq,{status:self.conf.state.lc_button});
				var triggerText = self.conf.triggerText.va;
				if(self.conf.clientConfig && self.conf.clientConfig.enable_livechat==true) 
					triggerText = self.conf.triggerText.lc;
				self.renderTemplate(cvjq,{status:"change_trigger_text",data:triggerText});
				self.conf.loading.autoshow && (VAMD.util.getStorage('VA_OPEN') == 1) && cvjq(VAMD).trigger('va.open');
				self.conf.loading.autoshow && self.conf.templateType.popup && cvjq(VAMD).trigger('va.open');
				if(window.location.href == 'https://www.myer.com.au/content/faq'){
				// if(window.location.href == 'https://www.dev.aws.myer.com.au/'){
					// self.conf.loading.autoshow = true;
					// self.conf.va.businessArea = 'Root';
					// self.conf.va.Channel = 'Root';
					cvjq(VAMD).trigger('va.open',[{businessArea: 'Root', Channel: 'Root.Website'}]);
					}
			});
			
			// Enable global config monitoring if client-side global config object is enabled
			self.conf.globalConfig && self.configMonitor();
			
			VAMD.conf.component.livechat && (VAMD.lc_agent_check = VAMD.lc_agent_check());
			
			if(self.conf.clientConfig && self.conf.clientConfig.enable_livechat && self.conf.availChecks.startAvailChecks == "immediately")
				self.conf.availChecks.changeTriggerVisibility = true;
			else
				self.conf.availChecks.changeTriggerVisibility = false;
			
			self.conf.availChecks.startAvailChecks == "immediately"  && VAMD.lc_agent_check.start_check(self.conf.availChecks.availChecks_queueId, self.onAvailCheckResult)
		});
	}	
	
	// Load the template from a file
	var loadTemplate = function($, callback) {
		if(!self.conf.production) {
			$.ajax({
				type: 'GET',
				url: self.conf.resourceURI + '/js/template.cv.html',
				contentType: 'text/plain',
				async: false,
				jsonpCallback: "cvcallback",
				cache: false,
				xhrFields: { withCredentials: false },
				timeout: 10000
			})
			.done(function(template) {
				self.conf.template = template;
				callback && callback();
				if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
					// let add_to_bag_url = new URL('https://myer.aus.apac.creativevirtual.com/myer_staging_ui/');
					// let add_to_bag_url = new URL("https://www.myer.com.au/p/");
					let check_bag_url = new URL("https://www.myer.com.au/bag");
					let current_url = new URL(window.location.href);
					if(window.location.href.includes(check_bag_url) || current_url.pathname.includes('/p/')){
						$('.va-trigger').attr('style','bottom: 100px !important');
					}
				}
				
			})
			.fail(function(jqXHR, exception) {
				VAMD.util.ajaxErrorParse(jqXHR, exception);
				callback && callback();
			});
		}
		else 
			callback && callback();
		
	}
	
	self.configMonitor = function() {
		Object.defineProperty(va_config, 'watch', {
			value: function(prop, handler) {
				var setter = function(val) {
					return val = handler.call(this, val);
				};
				Object.defineProperty(this, prop, {
					set: setter
				});
			}
		});
	}
	
	// Render the template on screen
	self.renderTemplate = function($, params) {
		
		var $va = $('#virtual-assistant');
		var t = (typeof params != 'undefined') ? params.status : 'null';
		
		// instances where you want to control whether FAQ area is available or not. Below handles this dynamically
		!self.conf.component.faqs ? $va.addClass('va-nofaqs') : $va.removeClass('va-nofaqs');
		
		$va.addClass('va-fade');
		
		switch(t) {
			case 'open':
				$va.addClass('va-active');
				self.conf.state.localStorage && VAMD.util.setStorage({VA_OPEN: 1});
				// if(window.screen.height * window.devicePixelRatio < 1400){cvjq('.va-wrap').css('height', 500 + "px");}
				break;
				
			case 'close':
				$va.removeClass('va-active');
				self.conf.state.localStorage && VAMD.util.setStorage({VA_OPEN: 0});
				break;
				
			case 'reload':
				$('.va-pod-wrap').remove();
				$va.removeClass('va-active');
				if(self.conf.templateType.popup) {
					$va.addClass('va-tmpl-popup');
				}
				else {
					switch(self.conf.templateType.type) {
						case 'slideout':
							$va.addClass('va-tmpl-sld');
							break;
						case 'modal':
							$va.addClass('va-tmpl-mod');
							break;
						case 'corner':
							$va.addClass('va-tmpl-corner');
							break;
						default:
							$va.addClass('va-tmpl-sld');
					}
				}
				$va.attr('tabindex', 0).append(self.conf.template);			
				break;
			case 'show_lc_button':
				$va.find('.va-wrap, .va-body, .va-inp').addClass('lcbutton');
				$va.find('.livechat_button').show();
				break
			case 'hide_lc_button':
				$va.find('.va-wrap, .va-body, .va-inp').removeClass('lcbutton');
				$va.find('.livechat_button').hide();
				break
			case 'change_trigger_text':
				$va.find('.va-trigger').html(params.data);
				break
			default:
				if(self.conf.templateType.popup) {
					$va.addClass('va-tmpl-popup');
				}
				else {
					switch(self.conf.templateType.type) {
						case 'slideout':
							$va.addClass('va-tmpl-sld');
							break;
						case 'modal':
							$va.addClass('va-tmpl-mod');
							break;
						case 'corner':
							$va.addClass('va-tmpl-corner');
							break;
						default:
							$va.addClass('va-tmpl-sld');
					}
					
				}
				$va.attr('tabindex', 0).append(self.conf.template);
		}
	}
	
	self.engineInit = function(params) {
		self.conf.debug && console.log('[VA-INFO] Initialising engine init');

		if(typeof params == 'object') {
			self.conf.debug && console.log('[VA-INFO] Passing custom launch data for to init. Data: ');
			self.conf.debug && console.log(params);
			va.init(Object.assign({init: 1}, params));
			// va.init($.extend(params, {init: 1}));
		}
		else {
			va.init({init: 1});
		}
	}
	
	window.vaStartupData = {
		data: {
			firstName: '',
			lastName: '',
			emailAddress: ''
			// customField2: "123456789"
		}
	};
	
	self.pureCloudInit = function (userData) {
		self.conf.debug && console.log('[VA-INFO] Going straight to purecloud!');
		
		// const customData = JSON.parse(VAMD.util.getStorage('USER_DATA'));
		// VAMD.conf.purecloudchat.service.QUEUE_NAME = customData['queueName'];
		// VAMD.conf.purecloudchat.user.firstName = customData['firstName'];
		// VAMD.conf.purecloudchat.user.lastName = customData['lastName'];
		// VAMD.conf.purecloudchat.user.emailAddress = customData['emailAddress'];
		// VAMD.conf.purecloudchat.user.orderID = customData['orderID'];
		
		//VAMD.conf.purecloudChat.user.phone = customData['phone'];
		// VAMD.conf.pureCloudChat.user.myeroneID = customData['myeroneID'];
		VAMD.pcc.startLiveChat();
	};

    var loadScript = function(file, callback) {
        callback = callback || function() {};
        var filenode;
        var jsfile = /(.js)$/i;
        var cssfile = /(.css)$/i;
        var path = self.conf.state.ls == 1 ? '/js/' : '/lcmodule/libs/';
		var version = typeof self.loaderConfig.version != 'undefined' ? self.loaderConfig.version : 0;

        self.conf.debug && console.log('[VA-INFO] Attempting to load %c%s', 'font-weight:bold', file);
		if (jsfile.test(file)) {
			if (file != 'lc_client.js' && file != 'lc_restClient.js') {
				filenode = document.createElement('script');
				filenode.src = VAMD.conf.resourceURI + path + file + '?v=' + version;
				// IE
				if (filenode.readyState) {
					filenode.onreadystatechange = function () {
						if (filenode.readyState === 'loaded' || filenode.readyState === 'complete') {
							filenode.onreadystatechange = null;
							self.conf.debug && console.log('[VA-INFO] %c%s has been successfully loaded', 'color:#0000FF', file);
							callback();
						}
					};
				}
				// normal
				else {
					filenode.onload = function () {
						self.conf.debug && console.log('[VA-INFO] %c%s has been successfully loaded', 'color:#0000FF', file);
						callback();
					};
				}
				document.getElementById("virtual-assistant").appendChild(filenode);
			}
			else {
				if ((VAMD.conf.livechat.config.restOverWebSocket == true && file == 'lc_restClient.js') || (VAMD.conf.livechat.config.restOverWebSocket == false && file == 'lc_client.js')) {
					filenode = document.createElement('script');
					filenode.src = VAMD.conf.resourceURI + path + file + '?v=' + version;
					// IE
					if (filenode.readyState) {
						filenode.onreadystatechange = function () {
							if (filenode.readyState === 'loaded' || filenode.readyState === 'complete') {
								filenode.onreadystatechange = null;
								self.conf.debug && console.log('[VA-INFO] %c%s has been successfully loaded', 'color:#0000FF', file);
								callback();
							}
						};
					}
					// normal
					else {
						filenode.onload = function () {
							self.conf.debug && console.log('[VA-INFO] %c%s has been successfully loaded', 'color:#0000FF', file);
							callback();
						};
					}
					document.getElementById("virtual-assistant").appendChild(filenode);
				} else {
					callback();
				}
			}
        } else if (cssfile.test(file)) {			
            filenode = document.createElement('link');
            filenode.rel = 'stylesheet';
            filenode.type = 'text/css';
            filenode.href = self.conf.resourceURI + '/css/' + file + '?v=' + version;
            document.getElementById("virtual-assistant").appendChild(filenode);
            self.conf.debug && console.log('[VA-INFO] %c%s has been successfully loaded', 'color:#0000FF', file);
            callback();
        } else {
            self.conf.debug && console.error('[VA-ERROR] Unknown file type to be loaded.');
        }
    };
	
    self.requiredScripts = function() {
        var index = 0;
		var cont = true;
		
        return function(files, callback) {
			
			if(!self.conf.loadJQ && cont && typeof window.jQuery !== 'undefined') {
				index = 1;
				cont = false;
			}		
		
            // use(cvjq = $) to grab the client jQuery instead
            //(self.conf.loadJQ) && (index == 1) && (self.conf.state.ls == 1) && (cvjq = jQuery.noConflict(true));
			
			if(self.conf.loadJQ && index == 1) {
				cvjq = jQuery.noConflict(true);
			}
			else if(!self.conf.loadJQ && index == 1) {
				cvjq = $;
				self.conf.debug && console.log('[VA-INFO] Using parent page jQuery %s', cvjq.fn.jquery);
			}
			
            index += 1;
            loadScript(files[index - 1], callBackCounter);

            function callBackCounter() {
                (index === files.length) ? (index = 0, callback()) : self.requiredScripts(files, callback);
            };
        };
    }();
		
	self.loadScripts = function(SL, callback) {
		self.conf.debug && console.group('[VA-INFO] Resource loading');
		self.requiredScripts(SL, function() {
			self.conf.debug && console.groupEnd();
			self.conf.debug && console.log('[VA-INFO] %cAll scripts were successfully loaded', 'color: #01ab4d');
			callback && callback();
		});
	};
	
	self.useMobChannel = function($) {
		self.conf.screenWidth = $(window).innerWidth();
		if(self.conf.screenWidth <= self.conf.threshold) {
			return true;
		}
		else {
			return false;
		}
	}
	
	self.events = function($) {
		
		var $va = $('#virtual-assistant');
		
		// Toggle VA
		$(VAMD).on('va.toggle', function(e, data) {
			VAMD.conf.component.sso && !VAMD.conf.state.auth && VAMD.sso.checkUser();
			
			// Open
			if(self.conf.state.mode == 1)
				if(!self.conf.state.active) {
					self.conf.debug && console.log('[VA-INFO] %cVA is being opened', 'color:#017aaf');
					//Restart the superplaceholder if already instanciated.
					if (self.conf.superplaceholder.enable && self.conf.superplaceholder.instance){
						self.conf.debug && console.log('[VA-INFO] Restarting the superplaceholder on VA Open');
						self.conf.superplaceholder.instance.stop();
						cvjq("#virtual-assistant #entry").attr("placeholder", "");
						setTimeout(function(){ self.conf.superplaceholder.instance.start(); }, 150);
					}		
					self.conf.availChecks.startAvailChecks == "open" && VAMD.lc_agent_check.start_check(self.conf.availChecks.availChecks_queueId, self.onAvailCheckResult)	
					!self.conf.state.loaded && self.engineInit(data);
					self.renderTemplate($, {status: 'open'});
					self.conf.state.active = true;
				}
				// Close
				else {
					self.conf.debug && console.log('[VA-INFO] %cVA is being closed', 'color:#bb0101');
					self.renderTemplate($, {status: 'close'});
					self.conf.state.active = false;
				}
			if(self.conf.state.mode == 2){
				var open_lc_window = function() {
						self.conf.debug && console.log('[VA-INFO] %cLC is being opened', 'color:#017aaf');
						self.renderTemplate(cvjq,{status:'hide_lc_button'});
						self.renderTemplate($, {status: 'open'});
						self.conf.state.active = true;
						if(self.conf.state.agents_available == true)
							VAMD.lc.offerLiveChat();
						
						// Commenting due to interference with Genesys live when reloading the page.
						// else
							// VAMD.lc.showAvailabilityDialog(cvjq);
				}
				if(!self.conf.state.active) {
					if(self.conf.availChecks.startAvailChecks == "open" ||  self.conf.availChecks.startAvailChecks == "once")
						VAMD.lc_agent_check.start_check(self.conf.availChecks.availChecks_queueId, function(data){
							self.onAvailCheckResult(data);
							if(!self.conf.state.active)
								open_lc_window();

					})
					else
						open_lc_window();
						
				}
				// Close
				else {
					self.conf.debug && console.log('[VA-INFO] %cLC is being closed', 'color:#bb0101');
					self.renderTemplate($, {status: 'close'});
					self.conf.state.active = false;
				}

			}
		});
			
		// Close the VA
		$(VAMD).on('va.close', function(e, data) {
			self.conf.debug && console.log('[VA-INFO] %cVA is being closed', 'color:#bb0101');
			self.renderTemplate($, {status: 'close'});
			self.conf.state.active = false;
		});
			
		// Open the VA
		$(VAMD).on('va.open', function(e, data) {
			self.conf.debug && console.log('[VA-INFO] %cVA is being opened', 'color:#017aaf');
			self.renderTemplate($, {status: 'open'});
			// don't call engine if chat session is active
			if (!VAMD.util.getStorage('PCC_DATA')) {
			  !self.conf.state.loaded ? self.engineInit(data) : (typeof data === 'object') && va.request(data);
			} else {
			  self.pureCloudInit(userData);
			}
			self.conf.state.active = true;
			VAMD.conf.component.sso && !VAMD.conf.state.auth && VAMD.sso.checkUser();
		});
			
		// Render the template	
		$(VAMD).on('va.render', function() {
			self.renderTemplate($);
		});
			
		// Re-render the template
		$(VAMD).on('va.re-render', function() {
			VAMD.renderTemplate($, {status:'reload'});
			self.conf.state.active = false;
		});
		
		// VA trigger element
		$va.on('click', '.va-trigger', function() {
			$(VAMD).trigger('va.toggle');
		});
		
		$va.on('keyup', '.va-trigger', function(e) {
			(e.keyCode === 13) && $(VAMD).trigger('va.toggle');
		});
			
		// VA launched/input received from the parent page input field
		$('body').on('click', '.va-launch-button', function() {
			var entryText = $('.searchField').val();
			$(VAMD).trigger('va.open', [{entry: entryText}]);
			self.conf.state.loaded && va.request({entry: entryText});
		});
		
		// User clicks enter on parent page's entry field
		$('body').on('keypress', '.searchField', function(e) {
			if(e.which == 13) {
				$('.va-launch-button').trigger('click');
				return false;
			}
		});
		
		// Toggle FAQ pod
		$va.on('click', '.va-related-head.va-toggle', function() {
			if($(this).hasClass('va-active')) {
				$(this).parent().removeClass('va-nav-open');
				$(this).removeClass('va-active');
				$(this).text('Related Questions');
				$(this).css('background','#ffffff');
				// if(cvjq('.va-dropdown').hasClass('dropdown-active')){cvjq('.va-dropdown').removeClass('dropdown-active');}
				$('.va-dropdown').removeClass('dropdown-active');
			}
			else {
				$(this).parent().addClass('va-nav-open');
				$(this).addClass('va-active');
				$(this).text('Back To Chat');
				$(this).css('background', '#f8f8f8');
				if($('.va-related-nav')[0].firstElementChild.firstElementChild.innerText=='FAQ'){$('.select-faq-category').hide();}
				
			}
		});
		
		// Close the VA
		$va.on('click', '.va-close', function() {
			$(VAMD).trigger('va.close');
		});
		
		// Modal window close
		$va.on('click', '.va-modal-close, .va-modal-close-normal-button', function() {
			self.conf.debug && console.log('[VA-INFO] %cClosing active modal window', 'color:#bb0101');
			VAMD.util.removeModalWindow($, function() {
				if(self.conf.state.mode == 1)
					self.engineInit()
				if(self.conf.state.mode == 2){
					self.conf.livechat.state.modalCred = false
					$(VAMD).trigger('va.close');
				}
			});
		});
		
		$va.on('click', '.lc-modal-wrap .lc-modal-close, .modal-close-btn', function() {
			cvjq('.va-modal-shadow').remove();
			cvjq('.lc-modal-wrap').remove();
		})
		
		// VA will be closed when user presses Esc. Part of WCAG 2.1 requirement
		$(document).on('keyup', function(e) {
			if(e.keyCode === 27) {
				if(!self.conf.templateType.popup) {
					if($va.has(e.target).length !== 0 || $(e.target).is($va)) {
						self.conf.state.active && $(VAMD).trigger('va.close');
					}
				}
				else {
					window.close();
				}
			}
		});
		
		$(document).on('mouseup', function(e) {
			if(self.conf.component.autocomplete) {
				var container = $('.va-autocomplete');
				if(!container.is(e.target) && container.has(e.target).length === 0) {
					self.autocomplete.destroy($);
				}
			}
		});
		
		$va.on('blur', '#entry', function() {
			if (self.conf.superplaceholder.enable && self.conf.superplaceholder.instance){
					if( cvjq("#virtual-assistant #entry").attr("placeholder") == VAMD.conf.superplaceholder.instance_sentences[VAMD.conf.superplaceholder.instance_sentences.length - 1]){
						self.conf.debug && console.log('[VA-INFO] Restaring the Superplaceholder on Blur');
						self.conf.superplaceholder.instance.stop();
						cvjq("#virtual-assistant #entry").attr("placeholder", "");
						self.conf.superplaceholder.instance.start();					
					}
					else{
						self.conf.debug && console.log('[VA-INFO] Not restaring the Superplaceholder on Blur as it has yet to finish');
					}
			}
		});
		

	};
	
	self.onAvailCheckResult = function(result) {
		var $va = cvjq("#virtual-assistant")
		self.conf.state.agents_available = result.status;
		self.conf.state.agents_num = result.num_agents;
		if(self.conf.availChecks.changeButtonVisibility) {
			result.status && self.renderTemplate(cvjq,{status:"show_lc_button"});
			!result.status && self.renderTemplate(cvjq,{status:"hide_lc_button"});
		}
		if(self.conf.availChecks.showAvailableAgents) {
			$va.find('.livechat_button a.va-cta-link').html("Start live chat (available agents: " + result.num_agents + ")")			
		}
		if(self.conf.availChecks.changeTriggerVisibility == true && self.conf.state.active != true){
			 result.status && $va.find('.va-trigger-pod').show();
			!result.status && $va.find('.va-trigger-pod').hide();
		}
		if($va.find(".va-modal.va-lc-avail-dialog").length>0){
			 result.status && $va.find(".va-lc-user-dialog-title.va-modal-title").html(VAMD.conf.livechat.msg.stat15);
			 result.status && $va.find(".va-modal-lc-proceed").removeClass('hide');
			!result.status && $va.find(".va-lc-user-dialog-title.va-modal-title").html(VAMD.conf.livechat.msg.stat13);
			!result.status && $va.find(".va-modal-lc-proceed").addClass('hide');
		}

	}
	
	return self;
}(window.VAMD));

VAMD.ics = (function () {
	
	var self = {};
	
	self.init = function($) {
		VAMD.conf.debug && console.log('[VA-INFO] %cEnabling [ICS]', 'color:#F84586');
		self.events($);
	}

	self.create = function($, type, sessionid, transid, otherReason) {
		if (type=="yes"){
			VAMD.util.createModalWindow($, 'va-ics-dialog va-ics', false, function() {
				var $title = '<span class="ics-yes-message">Great! Thank you for your feedback</span>',
				$close = $('<a />', {'href': 'javascript:void(0)', 'class': 'va-ics-close'}).append('');
				
				
				var ics_report_url = 'https://myer.aus.apac.creativevirtual.com/myer_live/ics.jsp?sessionId=' + sessionid + '&transactionId=' + transid + '&jsonIcs=%7B"show_ics":"true","helped":"yes"%7D'
				$.ajax({
					url: ics_report_url,
					type: 'GET',
					dataType: 'json',
					success: function(data) {
						console.log("submited ICS offered record")
					},
					error: function(jqXHR, exception) {
						VAMD.conf.debug && console.log('[VA-ERROR] Submit ICS Error: ' + jqXHR.responseText);
					}
				});

                $('.va-modal').append($('<h2 />').append('Thank you for your feedback')).append($title).append($close)
				// hide the ICS (no resubmssion)
				$("#virtual-assistant .va-ans-node:last-child .ics_entry").hide()
			});
        } else if (type == "no") {
			VAMD.util.createModalWindow($, 'va-ics-dialog va-ics', false, function() {
			var $list = $('<ul/>'),
				$title =  $('<h2/>', {'class': 'va-modal-title'}).append("Why wasn't this answer helpful?") ,
				$button = $('<button />', {'class': 'va-btn-ics', 'type': 'submit'}).append('Submit'),
				$close = $('<a />', {'href': 'javascript:void(0)', 'class': 'va-ics-close'}).append('Close'),
				i = 1,
				items = [{'DefaultClickText': 'The answer didn\'t match my question'}, {'DefaultClickText': 'The answer was unclear'}, {'DefaultClickText': 'Not enough information'}]
				

			$.each(items, function(i, item) {
				if(item.DefaultClickText != "" && item.DefaultClickText != 'Another Reason') {
					var $option = $('<li/>');
					$option
						.append($('<input/>', {'type': 'radio', 'value': item.DefaultClickText, 'name': 'va-ics-opt', 'id': 'va-ics-val' + i}))
						.append($('<label/>', {'for': 'va-ics-val' + i})
							.append(item.DefaultClickText));
					$list.append($option);
					i++;
				}
			});
			
			if((typeof otherReason !== 'undefined')) {
				var $option = $('<li/>');
				$option
					.append($('<input/>', {'type': 'radio', 'value': 'custom', 'name': 'va-ics-opt', 'id': 'va-ics-val10'}))
					.append($('<label/>', {'for': 'va-ics-val10'})
						.append('Another Reason'))
					.append($('<div />', {'class': 'va-ics-oth-inp'}).append($('<textarea />', {'class': 'va-input-other-reason', 'placeholder': 'Enter your custom feedback here'})))
					.append($('<div />', {'class': 'va-other-reason-count'}).append($('<span />', {'class': 'chars'}).append('400')).append(' characters remaining'));
				$list.append($option);
			}			
			
			// add transid and sessionid for no option
			$('.va-ics-dialog').attr({'data-sessionId' : sessionid, 'data-transid': transid});

			$('.va-modal').append($title).append($list).append($button).append($close);
		    });
		}			
	}
	
	
	var _request = function(entry) {
		if(entry.length < 1)
			return false;
		va.request({
			entry: entry,
			mainCat: va.mainCat,
			DTreeRequestType: 0,
			DTREE_OBJECT_ID: va.dTreeObjectId,
			DTREE_NODE_ID: va.dTreeNodeId
		});
	};
	
	var _destroy = function($) {
		VAMD.util.removeModalWindow($);
	}
	
	self.events = function($) {
		var $va = $('#virtual-assistant');
	
		// ICS submit
		$va
			.on('click', '.va-ics .va-btn-ics', function() {
				var icsEntry = "";
				$('.va-ics input[name="va-ics-opt"]').each(function() {
					($(this).prop('checked')) && (icsEntry = $(this).val());
				});			
				if(icsEntry.length < 1) {
						icsEntry = "No reason given"
				}
				
				if(icsEntry == 'custom') {
					if(icsEntry.length < 1) {
						icsEntry = "No reason given"
					}
				}
				
				var comment = cvjq('.va-input-other-reason').val();	
				
				var ics_report_url = 'https://myer.aus.apac.creativevirtual.com/myer_live/ics.jsp?sessionId=' + $(".va-ics-dialog").data("sessionid") + '&transactionId=' + $(".va-ics-dialog").data("transid") + '&jsonIcs=%7B"show_ics":"true","helped":"no", "Why unhelpful":"' + icsEntry +'", "Comment":"' + comment + '"%7D'
				$.ajax({
					url: ics_report_url,
					type: 'GET',
					dataType: 'json',
					success: function(data) {
						console.log("submited ICS offered record")
					},
					error: function(jqXHR, exception) {
						VAMD.conf.debug && console.log('[VA-ERROR] Submit ICS Error: ' + jqXHR.responseText);
					}
				});
				
				// hide the ICS (no resubmssion)
				$("#virtual-assistant .va-ans-node:last-child .ics_entry").hide()
				
				$("#virtual-assistant .va-modal-wrap").html('<h2>Thank you for your feedback</h2><div class="ics-yes-message">Great! Thank you for your feedback</div><a href="javascript:void(0)" class="va-ics-close"></a>')

				//_request(icsEntry);
				//_destroy($);
		});
		
		// ICS close
		$va
			.on('click', '.va-ics-close', function() {
				//_request('_ics_user_cancelled_');
				_destroy($);
			});
		
		// ICS character counter
		$va
			.on('keyup', '.va-input-other-reason', function() {
				var maxlength = 400;
				if($(this).val().length > maxlength){
					$(this).val($(this).val().substring(0, maxlength));
				}
				else {
					$('.va-other-reason-count span').text(maxlength - $(this).val().length);
				}
			});
	}
	

	
	
	return self;
}());


VAMD.autocomplete = (function () {
	var self = {};
	var requestParams = {
		AUTO_COMPLETE: 1,
		FAQ: 0
	};
	
	self.destroy = function($) {
		$('#virtual-assistant .va-autocomplete').removeClass('va-show').find('ul').remove();
	}
	
	var typewatch = (function(){
		var timer = 0;
		return function(callback, ms){
			clearTimeout(timer);
			timer = setTimeout(callback, ms);
		}  
	})();
	
	var select = function() {
		$('#virtual-assistant .va-inp-txt').val($('.va-autocomplete-selected a').text());
	};
	
	self.init = function($) {
		VAMD.conf.debug && console.log('[VA-INFO] %cEnabling AUTOCOMPLETE', 'color:#F84586');
		self.events($)
	}
	
	self.events = function($) {

		var $va = $('#virtual-assistant');
	
		$va.on('keyup', '.va-inp-txt',  function(e) {
			if(VAMD.conf.state.loaded && VAMD.conf.state.mode == 1) {
				(e.keyCode == 27) && self.destroy($);
				var input = $(this).val();
				
				VAMD.conf.state.typing = true;
				
				typewatch(function() {
					if(input.length > 2 && e.keyCode != 38 && e.keyCode != 40 && e.keyCode != 27 && e.keyCode != 13) {
						requestParams = $.extend(requestParams, {entry: input, ident:$va.ident});

						VAMD.conf.debug && console.group('[VA-INFO] Autocomplete request')
						VAMD.conf.debug && console.log('[VA-INFO] Sending autocomplete request to the engine. Request data: %o', requestParams);
						VAMD.conf.debug && console.groupEnd();

						$.ajax({
							url: VAMD.conf.autocompleteURI,
							type: 'GET',
							data: requestParams
						})
						.done(function(data) {
							var $ul = $('<ul/>');
							var t = 0;
							$(data).find('AutoComplete').each(function(i, item) {
								if(t < 3) {
									var $listItem = $('<li/>')
										.append($('<a/>', {
											'href': 'javascript:void(0)',
											'title': '',
											'data-recognition-id': $(item).find('RecognitionId').text(),
											'data-dtree': 'false',
											'data-answer-id': $(item).find('AnswerLinkId').text()
										})
											.append($(item).find('QuestionText').text()));
									$ul.append($listItem);
								}
								else {
									return false;
								}
								t++;
							});
							self.destroy($);
							(t > 0 & VAMD.conf.state.typing) && $('#virtual-assistant .va-autocomplete').append($ul).addClass('va-show');
						})
						.fail(function(jqXHR, exception) {
							VAMD.util.ajaxErrorParse(jqXHR, exception);
						});
						
					}
					if(input.length <= 1) {
						self.destroy($);
					}
				}, 500);
			}
		});
		
		$va.on('keydown', '.va-inp-txt', function(e) {
			var $autoc = $('#virtual-assistant .va-autocomplete');
			
			// Enter
			if(e.keyCode == 13) {					
				$autoc.find('li').each(function() {
					if($(this).hasClass('va-autocomplete-selected')) {
						$('.va-inp-txt').val($(this).children('a').text());
						self.destroy($);
					}
				});
			}
			
			// Down
			if(e.keyCode == 40) {
				if($autoc.find('li').hasClass('va-autocomplete-selected')) {
					if($autoc.find('li').last().hasClass('va-autocomplete-selected')) {
						$autoc.find('li').last().removeClass('va-autocomplete-selected');
						$autoc.find('li').first().addClass('va-autocomplete-selected');
					}
					else {
						$autoc.find('li.va-autocomplete-selected').removeClass('va-autocomplete-selected').next().addClass('va-autocomplete-selected');
					}
				}
				else {
					//console.log(2);
					$autoc.find('li').first().addClass('va-autocomplete-selected');
				}
			}
			
			// Up
			if(e.keyCode == 38) {
				if($autoc.find('li').hasClass('va-autocomplete-selected')) {
					if($autoc.find('li').first().hasClass('va-autocomplete-selected')) {
						$autoc.find('li').first().removeClass('va-autocomplete-selected');
						$autoc.find('li').last().addClass('va-autocomplete-selected');							
					}
					else {
						$autoc.find('li.va-autocomplete-selected').removeClass('va-autocomplete-selected').prev().addClass('va-autocomplete-selected');
					}
				}
				else {
					$autoc.find('li').last().addClass('va-autocomplete-selected');
				}
			}
		});
		
		$(document)
			.on('click', '.va-autocomplete li', function() {
				self.destroy($);
		});
	}
	return self;
}());

/* Helper class  */
VAMD.util = (function () {

	var self = {};
	
	// Get parameter from URI by name
	self.getParameterByName = function(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[#&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));		
	}
	
	// Handle Ajax errors and output to console
	self.ajaxErrorParse = function(jqXHR, exception) {
		var msg = '';
			
		if(jqXHR.status === 0) {
			msg = '[VA-ERROR] Not connected. Verify Network.';
		}
		else if(jqXHR.status == 404) {
			msg = '[VA-ERROR] Requested page not found [404].';
		}
		else if(jqXHR.status == 500) {
			msg = '[VA-ERROR] Internal Server Error [500].';
		}
		else if(exception === 'parsererror') {
			msg = '[VA-ERROR] Requested JSON parse failed.';
		}
		else if(exception === 'timeout') {
			msg = '[VA-ERROR] Request has timed out.';
		}
		else if (exception === 'abort') {
			msg = '[VA-ERROR] Ajax request aborted.';
		}
		else {
			msg = '[VA-ERROR] Uncaught Error: ' + jqXHR.responseText;
		}
		VAMD.conf.debug && console.error(msg);
	}

	// Check if local storage is available
	self.checkStorage = function() {
		if(typeof localStorage !== 'undefined') {
			try {
				localStorage.setItem('va_test', 'yes');
				if(localStorage.getItem('va_test') === 'yes') {
					localStorage.removeItem('va_test');
					return true;
				}
				else {
					return false;
				}
			}
			catch(e) {
				return false;
			}
		}
		else {
			return false;
		}
	}
	
	// Clear local storage value
	self.clearStorage = function(key) {
		if(self.checkStorage()) {
			VAMD.conf.debug && console.log('[VA-INFO] %cRemoving local storage node with key: %s', 'color:#999999', key);
			localStorage.removeItem(key);
		}
		else {
			VAMD.conf.debug && console.warn('[VA-WARN] Session storage is not available');
			return false;			
		}
	}
	
	// Help to supress the multiple trigger of GCP connect
	self.debounce = (func, wait, immediate) => {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
  };
	
	// Set local storage values
	self.setStorage = function(data) {
		if(self.checkStorage()) {
			for(var key in data) {
				data.hasOwnProperty(key) && ("object" == typeof data[key] ? (VAMD.conf.debug && console.log("[VA-INFO] %cSetting local storage key %s to %s", "color:#999999", key, JSON.stringify(data[key])),
                localStorage.setItem(key, JSON.stringify(data[key]))) : (VAMD.conf.debug && console.log("[VA-INFO] %cSetting local storage key %s to %s", "color:#999999", key, data[key]),
                localStorage.setItem(key, data[key])))
			}
		}
		else {
			VAMD.conf.debug && console.warn('[VA-WARN] Session storage is not available');
			return false;
		}
	}
	
	// Get local storage values based on key
	self.getStorage = function(key) {
		if(self.checkStorage()) {
			var data = localStorage.getItem(key) === null ? false : localStorage.getItem(key);
		}
		return data;
	}
	
	self.getTimeoutOffset = function() {
		var offset = Math.floor((Date.now() - self.getStorage('VA_SESSIONTIME')) / 60000);
		return offset;
	}
	
	// Create an empty generic modal window
	self.createModalWindow = function($, className, autoSize, callback) {
		var asc = autoSize ? 'va-modal-autosize' : '';
		var $modal = $('<div/>', {'class': 'va-modal-wrap ' + asc});
		$modal.append($('<div/>', {'class': 'va-modal ' + className}).append($('<a/>', {'href': 'javascript:void(0)', 'title': '', 'class': 'va-modal-close'})));
		$('.va-wrap')
			.append($('<div/>', {'class': 'va-modal-shadow'}))
			.append($modal);
		callback && callback();
	}
	
	// Destroy the generic modal window
	self.removeModalWindow = function($, callback) {
		$('.va-modal-wrap, .va-modal-shadow').remove();
		callback && callback();
	}

	// Invoke prompt modal dialog: Are you sure you want to quit LC?
	self.createSurveyForm = function($) {
			
		VAMD.util.createModalWindow($, 'va-lc-survey-dialog', false, function() {

			var $stars = $('<div/>', {'class': 'va-lc-survey-stars'});
			$stars
				.append($('<a/>', {'href': 'javascript:void(0)', 'title': '', 'class': 'va-lc-star va-lc-star1'}))
				.append($('<a/>', {'href': 'javascript:void(0)', 'title': '', 'class': 'va-lc-star va-lc-star2'}))
				.append($('<a/>', {'href': 'javascript:void(0)', 'title': '', 'class': 'va-lc-star va-lc-star3'}))
				.append($('<a/>', {'href': 'javascript:void(0)', 'title': '', 'class': 'va-lc-star va-lc-star4'}))
				.append($('<a/>', {'href': 'javascript:void(0)', 'title': '', 'class': 'va-lc-star va-lc-star5'}));

			var $comments = $('<textarea/>', {'class': 'va-lc-survey-comment'});

			var $buttonSubmit = $('<a/>', {'href': 'javascript:void(0)', 'class': 'va-lc-survey-submit', 'title': ''}).append('Submit');
			var $buttonCancel = $('<a/>', {'href': 'javascript:void(0)', 'title': '', 'class': 'va-lc-prompt-cancel'}).append('Cancel');
			
			$('.va-modal')
				.append($('<h3/>', {'class': 'va-lc-user-dialog-title'}).append('How helpful was the agent today?'))
				.append($('<div/>')
					.append($('<p/>', {'class': 'va-lc-eocs-title'}).append('How helpful were we today?'))
					.append($stars)
					.append($('<p/>').append('Any comments?'))
					.append($comments)
					.append($('<div/>', {
							'class': 'va-lc-info-options clearfix'
						})
						.append($buttonSubmit)
						.append($buttonCancel)
					)
				);
		});	
	}
	
	return self;
}());

VAMD.lc_agent_check = function () {

  var self = {};
  self.check_interval = VAMD.conf.availChecks.check_interval;
  self.check_tries = 0;
  self.check_exponent = VAMD.conf.availChecks.check_exponent;
  self.agent_availability_IntervalID = -1
  self.livechat_url = VAMD.conf.livechat.conn.livechatUrl.split("/livechat/")[0]
  var queue_check_result = undefined;
  
  function resetBackOff() {
	self.check_interval = VAMD.conf.availChecks.check_interval;
	self.check_tries = 0;
	self.check_exponent = VAMD.conf.availChecks.check_exponent;
  }

  self.slots_check = function (agents_id,callback) { //agents_id must be an array of numeric Agents IDs
      var url = self.livechat_url + "/StateManager/agents/state/customer/1/department/1?isCache=true&agentIds=" + agents_id.join(',') + '&ts=' + Date.now();
      cvjq.ajax({
        url: url,
        success: function (result) {

          if (result.code != 0 && result.agentInfoVOList[0]["code"] !== 0) {
            //backend error handling not implemented yet
          } else {
            var infoVOList = result.agentInfoVOList;
            var totalCurrentLoad = 0;
            var totalMaxConcurrentSessions = 0;
            var totalCurrentPushLoad = 0;
            for (var i = 0; i < infoVOList.length; i++) {
              var agent = infoVOList[i];
              var currentLoad = agent['currentLoad'];
              var maxPushLoad = agent['maxConcurrentSessions'];
              totalCurrentLoad = totalCurrentLoad + currentLoad;
              totalMaxConcurrentSessions = totalMaxConcurrentSessions + maxPushLoad
              totalCurrentPushLoad = totalCurrentPushLoad + agent['currentPushLoad'];
            }
            var slotsAvailable = totalMaxConcurrentSessions - totalCurrentLoad //should always be positive in theory
			callback && callback({slotsAvailable:slotsAvailable});
          }
        }
      });

    }  
  
  self.agent_availability = function (queue_id, callback) {
    var url = self.livechat_url + "/AvailabilityEngine/customer/1/department/1/queueAvailability?isCache=true&queueIds=" + queue_id + '&ts=' + Date.now()

    cvjq.ajax({
      url: url,
	})
	.done( function (result) {
        if (result.queueStateVOList[0]["code"] !== 0) {
          //in case of backend error (code!=0), we will backoff exponentially, see this jira: TECH-4369
		  self.check_interval = self.check_interval * self.check_exponent;
		  self.check_tries++;
        } else {
          resetBackOff()
          var num_agents = result.queueStateVOList[0]["availableAgents"].length
          var agent_availability_status = num_agents > 0
          queue_check_result = result.queueStateVOList[0];
		  var result = { status: agent_availability_status, queue_id: queue_id, num_agents: num_agents}
		  callback && callback(result);
	    }
    }).fail( function(jqXHR, textStatus, errorThrown) {
		if(jqXHR.readyState == 4) {
			//in case of fail, but only if the requested completed, we exponentially backoff
			self.check_interval = self.check_interval * self.check_exponent;
			self.check_tries++;
		}
	})
	
	if(self.check_tries > 6)
		self.check_exponent = 1.1		
	
    if(self.check_tries > 30 ) { //give up after 30 unsuccesfully tries
      clearInterval(self.agent_availability_IntervalID)
      self.agent_availability_IntervalID = -1;
      resetBackOff()
	  var result = { status: false, queue_id: queue_id, num_agents: -1,error:"retry_error"}
      callback && callback(result);
    }
	else
		if(VAMD.conf.availChecks.startAvailChecks != "once")
			self.agent_availability_IntervalID = setTimeout(function () {
				self.agent_availability(queue_id, callback);
			}, self.check_interval);
  }

  self.stop_check = function () {
    if (self.agent_availability_IntervalID != -1) {
      clearInterval(self.agent_availability_IntervalID)
      self.agent_availability_IntervalID = -1;
      resetBackOff()
    }
  }

  self.start_check = function (queue_id, callback) {
    if (self.agent_availability_IntervalID != -1)
      return;
    VAMD.conf.debug && console.log("Initiating LC agent_availability periodic check.");
    self.agent_availability(queue_id, callback);
  }

  return self;
};

// We check whether VA is to load automatically.
VAMD.conf.loading.auto && VAMD.init();


VAMD.myerone = (function () {
	var self = {};
	
	self.init = function ($) {
		VAMD.conf.debug && console.log('[VA-INFO] %cEnabling Myerone event listeners', 'color:#F84586');
		self.events($);
	}
	
	self.createModal = function($, type) {
		var $myeroneForm = $('<form />', {'class': 'myerone-form'});
		if (type == 'myeroneNumber') {
			VAMD.util.createModalWindow($, 'va-myerone-dialog', false, function() {
				var $body = '<input  required id="va-myeroneNumber" class="myerone-form-elem" placeholder="Enter MYER one number"/> \
				            <input id="va-btn-myeroneNmumber" class="myerone-form-elem" style="width:auto;" type="submit" value="Submit" />',
				$close = $('<a />', {'href': 'javascript:void(0)', 'class': 'va-myerone-close'}).append('');
				$('.va-modal').append($('<h2 />').append('Please enter your details below:')).append($myeroneForm.append($body)).append($close)
			});
			
			
		} else if (type == 'dob_phoneNumber') {
			VAMD.util.createModalWindow($, 'va-myerone-dialog', false, function() {
				var $body = '<input required id="va-myerone-PhoneNumber" class="myerone-form-elem" placeholder="Enter phone number"/> \
				<input id="va-myerone-DOBPicker" required class="myerone-form-elem" placeholder="DD-MM-YYYY"  />\
				<input id="va-btn-dob-phoneNumber" style="width:auto;" class="myerone-form-elem" type="submit" value="Submit" />',
				$close = $('<a />', {'href': 'javascript:void(0)', 'class': 'va-myerone-close'}).append('');
				$('.va-modal').append($('<h2 />').append('Please enter your details below:')).append($myeroneForm.append($body)).append($close);
			});
			
			
			
		}
	}
	
	self.reverseDateString = function (s){
		// Split date which are separated by - , /
		// Reverse the string to provide valid date format to API
		return s.trim().split("-").reverse().join("-").split("/").reverse().join("-");
	}
	
	self.formatPhoneNumber = function(s) {
		return s.replace(/\s/g, '');
	}

	self.events = function($) {
		var $va = $('#virtual-assistant');
	    //submit
		$va.on('click', '#va-btn-dob-phoneNumber', function(event) {
			event.preventDefault();
			var myeroneForm = document.getElementsByClassName('myerone-form');
			if( myeroneForm && myeroneForm[0].reportValidity()) {
				var $myeroneDOB = cvjq('#virtual-assistant #va-myerone-DOBPicker').val();
			    var $myeronePhoneNumber = cvjq('#virtual-assistant #va-myerone-PhoneNumber').val();
				va.request({entry: "What is my MYER one membership number?", 
				myeroneDOB: self.reverseDateString($myeroneDOB), myeronePhoneNumber: self.formatPhoneNumber($myeronePhoneNumber)});
				VAMD.util.removeModalWindow($);
			}
		});
		
		$va.on('click', '#va-btn-myeroneNmumber', function(event) {
			event.preventDefault();
			var myeroneForm = document.getElementsByClassName('myerone-form');
			if(myeroneForm && myeroneForm[0].reportValidity()) {
				var $myeroneNumber = cvjq('#virtual-assistant #va-myeroneNumber').val();
				va.request({entry: "What is my MYER one membership number?", myeroneNumber: $myeroneNumber});	
				VAMD.util.removeModalWindow($);
			}
		});
		
		
		$va.on('click', '.va-myerone-close', function() {
			VAMD.util.removeModalWindow($);
		});
		
		$va.on('click', '.myerone-buttons', function(event) {
			var myeroneButtonSearchBy = $(this).data()['searchBy'];
			self.createModal($, myeroneButtonSearchBy);
		});
	}
	
	return self;
}()); 


VAMD.myerGiftCard = (function () {
	var self = {};
	
	self.init = function ($) {
		VAMD.conf.debug && console.log('[VA-INFO] %cEnabling Myer Gift Cards event listeners', 'color:#F84586');
		self.events($);
	}
	
	self.createModal = function($) {
		var $myeroneForm = $('<form />', {'class': 'myer-giftcard-form'});
		
		VAMD.util.createModalWindow($, 'va-myer-giftcard-dialog', false, function() {
				var $body = '<input required id="va-myer-giftcard-number" class="myergiftcard-form-elem" placeholder="Enter Card Number"/> \
				<input id="va-myer-giftcard-pin" required class="myergiftcard-form-elem" placeholder="Enter Card PIN"  />\
				<input id="va-btn-myer-giftcard" style="width:auto;" class="myergiftcard-form-elem" type="submit" value="Submit" />',
				$close = $('<a />', {'href': 'javascript:void(0)', 'class': 'va-myerone-close'}).append('');
				$('.va-modal').append($('<h2 />').append('Please enter your details below:')).append($myeroneForm.append($body)).append($close);
			});
	}
	
	self.events = function($) {
		var $va = $('#virtual-assistant');
	    //submit
		$va.on('click', '#va-btn-myer-giftcard', function(event) {
			event.preventDefault();
			var myerGiftCardForm = document.getElementsByClassName('myer-giftcard-form');
			if(myerGiftCardForm && myerGiftCardForm[0].reportValidity()) {
				var $myerGiftCardNumber = cvjq('#virtual-assistant #va-myer-giftcard-number').val();
				var $myerGiftCardPIN = cvjq('#virtual-assistant #va-myer-giftcard-pin').val();
				va.request({entry: "What is my Myer gift card balance?",myerGiftCardNumber: $myerGiftCardNumber, myerGiftCardPIN: $myerGiftCardPIN});	
				VAMD.util.removeModalWindow($);
			}
		});
		
		$va.on('click', '.va-myer-giftcard-dialog .va-myerone-close', function() {
			VAMD.util.removeModalWindow($);
		});
		
		$va.on('click', '.myer-giftcard-buttons', function(event) {
			self.createModal($);
		});
	}
	
	return self;
}()); 


VAMD.CVHideVAWindow = (function () {
	var self = {};
	
	self.registerMutationObserver = function () {
		
		var searchProductBoxObserver = new MutationObserver(function(mutations) {
			for(const mutation of mutations) {
				if(mutation.target.className.includes('searchActive') && self.mobileCheck()) {
					cvjq('#virtual-assistant').hide();
				} else {
					cvjq('#virtual-assistant').show();
				}
			}
	    });
		
		var meganavObserver = new MutationObserver(function(mutations) {
			for(const mutation of mutations) {
				if(mutation.target.dataset.automation === 'mobileOpen' && self.mobileCheck()) {
					cvjq('#virtual-assistant').hide();
				} else {
					cvjq('#virtual-assistant').show();
				}
			}
	    });
		
		var filterButtonElemObserver = new MutationObserver(function(mutations) {
			for(const mutation of mutations) {
				switch(mutation.type) {
					case 'childList':
					if (mutation.addedNodes.length && 'dataset' in mutation.addedNodes[0]){
						let elem = mutation.addedNodes[0].dataset.automation 
						if(elem &&(elem.includes('close-button') || elem.includes('collapse-button')) && self.mobileCheck()) {
							cvjq('#virtual-assistant').hide();
						}
					} else if(mutation.removedNodes.length && cvjq(mutation.removedNodes[0]).attr('data-automation')
						&& cvjq(mutation.removedNodes[0]).attr('data-automation').includes('collapse-button')){
						
						cvjq('#virtual-assistant').show();
					}
					break;
				}
			}
	    });
		
		var checkoutWindowObserver = new MutationObserver(function(mutations) {
			for(const mutation of mutations) {
				if(mutation.addedNodes.length &&
				   cvjq(mutation.addedNodes[0]).find('form').attr('data-automation') ==='gift-wrap-drawer-content' && 
				   self.mobileCheck()) {
					   
					cvjq('#virtual-assistant').hide();
				
				} else if (mutation.removedNodes.length && 
				            cvjq(mutation.removedNodes[0]).find('form').attr('data-automation') ==='gift-wrap-drawer-content' ) {
					cvjq('#virtual-assistant').show();
				}
			}
	    });
		
		var loginWindowElemObserver = new MutationObserver(function(mutations) {
			for(const mutation of mutations) {
				switch(mutation.type) {
					case 'childList':
					if(self.mobileCheck()){
						if(mutation.addedNodes.length) {
							cvjq('#virtual-assistant').hide();
						} else if (mutation.removedNodes.length) {
					        cvjq('#virtual-assistant').show();
				        }
					}
					break;
				}
			}
	    });
		
		var vaHideObserver = new MutationObserver(function(mutations) {
		   for(const mutation of mutations) {
			   if(mutation.target.ariaExpanded === 'true') {
				   cvjq('#virtual-assistant').hide();
			   } else if(mutation.target.ariaExpanded === 'false') {
				   cvjq('#virtual-assistant').show();
			   }
			  }
	    });
		
		
		// mobile sidebar menu
		var meganavElem = document.getElementsByClassName('meganav-container')[0];
		var filterButtonElem = document.getElementById('filter-buttons');
		var checkoutWindowElem = document.getElementById('body-content');
		var loginWindowElem = document.getElementById('dropdown-menu');
		var searchBoxSuggestionElem = document.getElementById('mobileWrapper');
		var navigationElem = document.getElementById('navigation');
		
		searchBoxSuggestionElem && searchProductBoxObserver.observe(searchBoxSuggestionElem, {attributes: true});
		loginWindowElem && loginWindowElemObserver.observe(loginWindowElem, {childList: true, subtree: true});
		filterButtonElem && filterButtonElemObserver.observe(filterButtonElem, {childList: true, subtree: true});
		checkoutWindowElem && checkoutWindowObserver.observe(checkoutWindowElem, {childList: true, subtree: true});
		meganavElem && meganavObserver.observe(meganavElem, {attributes: true});
		filterButtonElem && filterButtonElemObserver.observe(filterButtonElem, {childList: true, subtree: true});
		checkoutWindowElem && checkoutWindowObserver.observe(checkoutWindowElem, {childList: true, subtree: true});		
		
		if (!self.mobileCheck()) {
			// only aplies to desktop 
			let navButtons = cvjq('#navigation ul li button');
		
		    for (let navButton of navButtons ) {
				vaHideObserver.observe(cvjq(navButton)[0], {attributes: true, attributeFilter: ['aria-expanded'] });
			}
		}
	}
	
	self.init = function ($) {
		VAMD.conf.debug && console.log('[VA-INFO] %cEnabling CV VA Hide Script', 'color:#F84586');
		self.events($);	
		self.registerMutationObserver();		
	}
	
	self.mobileCheck = function() {
		let check = false;
		
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
		
		return check;
	};
	
	
	
	self.events = function($) {
	}
	
	return self;
}()); 


// Legacy stuff
function ask_question(question, faqIDin, faqMainCatID, faqMainCatDesc, recognitionID, answerID) {
	return va.request({entry: question});
}

// Legacy stuff
function bot_nav(url, target, win_attr, noAutoNav) {
	if(target.length == 0) {
		window.open(url, '_self');
	}
	else {
		var win = window.open(url, '_blank');
		win.focus();
	}
}

function liveChatHandover(e, a, t, o) {
    VAMD.lc.liveChatHandover(e, a, t, o, VAMD.conf.livechat.vaStartupData.User.CustomerId, VAMD.conf.livechat.vaStartupData.User.QueueId, VAMD.conf.livechat.vaStartupData.User.QueueName)
}

/*! superplaceholder.js - v1.0.0 - 2019-01-04
* http://kushagragour.in/lab/superplaceholderjs/
* Copyright (c) 2019 Kushagra Gour; Licensed CC-BY-ND-4.0 */
!function(){var e="placeholder"in document.createElement("input");var r=Object.freeze({START:"start",STOP:"stop",NOTHING:!1}),l={letterDelay:100,sentenceDelay:1e3,loop:!1,startOnFocus:!0,shuffle:!1,showCursor:!0,cursor:"|",autoStart:!1,onFocusAction:r.START,onBlurAction:r.STOP};function s(t,o,e){var s,n;if(this.el=t,this.texts=o,e=e||{},this.options=function(t,o){var e={};for(var s in t)e[s]=void 0===o[s]?t[s]:o[s];return e}(l,e),this.options.startOnFocus||(console.warn("Superplaceholder.js: `startOnFocus` option has been deprecated. Please use `onFocusAction`, `onBlurAction` and `autoStart`"),this.options.autoStart=!0,this.options.onFocusAction=r.NOTHING,this.options.onBlurAction=r.NOTHING),this.timeouts=[],this.isPlaying=!1,this.options.shuffle)for(var i=this.texts.length;i--;)n=~~(Math.random()*i),s=this.texts[n],this.texts[n]=this.texts[i],this.texts[i]=s;this.begin()}s.prototype.begin=function(){var t=this;t.originalPlaceholder=t.el.getAttribute("placeholder"),(t.options.onFocusAction||t.options.onBlurAction)&&(t.listeners={focus:t.onFocus.bind(t),blur:t.onBlur.bind(t)},t.el.addEventListener("focus",t.listeners.focus),t.el.addEventListener("blur",t.listeners.blur)),t.options.autoStart&&t.processText(0)},s.prototype.onFocus=function(){if(this.options.onFocusAction===r.START){if(this.isInProgress())return;this.processText(0)}else this.options.onFocusAction===r.STOP&&this.cleanUp()},s.prototype.onBlur=function(){if(this.options.onBlurAction===r.STOP)this.cleanUp();else if(this.options.onBlurAction===r.START){if(this.isInProgress())return;this.processText(0)}},s.prototype.cleanUp=function(){for(var t=this.timeouts.length;t--;)clearTimeout(this.timeouts[t]);null===this.originalPlaceholder?this.el.removeAttribute("placeholder"):this.el.setAttribute("placeholder",this.originalPlaceholder),this.timeouts.length=0,this.isPlaying=!1},s.prototype.isInProgress=function(){return this.isPlaying},s.prototype.typeString=function(o,e){var t,s=this;if(!o)return!1;function n(t){s.el.setAttribute("placeholder",o.substr(0,t+1)+(t!==o.length-1&&s.options.showCursor?s.options.cursor:"")),t===o.length-1&&e()}for(var i=0;i<o.length;i++)t=setTimeout(n,i*s.options.letterDelay,i),s.timeouts.push(t)},s.prototype.processText=function(t){var o,e=this;this.isPlaying=!0,e.typeString(e.texts[t],function(){e.timeouts.length=0,e.options.loop||e.texts[t+1]||(e.isPlaying=!1),o=setTimeout(function(){e.processText(e.options.loop?(t+1)%e.texts.length:t+1)},e.options.sentenceDelay),e.timeouts.push(o)})};var t=function(t){if(e){var o=new s(t.el,t.sentences,t.options);return{start:function(){o.isInProgress()||o.processText(0)},stop:function(){o.cleanUp()},destroy:function(){for(var t in o.cleanUp(),o.listeners)o.el.removeEventListener(t,o.listeners[t])}}}};t.Actions=r,"object"==typeof exports?module.exports=t:"function"==typeof define&&define.amd?define(function(){return t}):window.superplaceholder=t}();

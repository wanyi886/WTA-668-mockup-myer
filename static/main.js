// Copyright 2019 Creative Virtual Ltd.
// All rights reserved. Redistribution or re-use of all or part of this code without prior permission is prohibited.
(function($) {
	function VA() {
		this.template;
		var init = true;			// bool: Is init
		this.firstRequest = true;	// bool: Is first request or subsequent one
		this.rn = 0;				// int: Request number counter. Can be used for various purposes when we need to identify request number.
		this.preventAjax = false;	// bool: Prevent additional engine requests when the current one is still active
		that = this;				// For use later in request method
		this.initEventRan = false;	// Has va.init event run yet?
		this.faqLoadTime 	= 	VAMD.conf.candidateCollectionCompute ? new Date() : 0;
		this.faqClickTime 	= 	VAMD.conf.candidateCollectionCompute ? new Date() : 0;
		// Default request parameters
		var defaults = {
			isCookieEnabled: 1
		};
		
		// Extend defaults object with configurable values
		$.extend(defaults, VAMD.conf.va);
		
		// Parse additional params from querystring
		var match,
			search = /([^&=]+)=?([^&]*)/g,
			decode = function(s) {
				return decodeURIComponent(s.replace(/\+/g, " "));
			};

		while(match = search.exec(window.location.search.substring(1))) {
		   defaults[decode(match[1])] = decode(match[2]);
		}

		// Core VA request method
		this.request = function(params) {
			
			// Prevent all requests whe 'enabled' flag is set to false
			if(!VAMD.conf.state.enabled) {
				return false;
			}
			
			// Prevent multiple Ajax requests
			if(that.preventAjax) {
				return false;
			}
			else {
				that.preventAjax = true;
			}

			// If vaStartupData is present and has values, we add them to defaults
			(that.firstRequest && typeof vaStartupData !== 'undefined') && $.extend(defaults, vaStartupData);
			
			// We assign business area to defaults object if it's being passed on startup
			(that.firstRequest && typeof params.businessArea !== 'undefined') && (defaults.businessArea = params.businessArea);
			
			// We assign a channel to defaults object if it's being passed on startup
			(that.firstRequest && typeof params.Channel !== 'undefined') && (defaults.Channel = params.Channel);
			// (window.location.href == "https://www.dev.aws.myer.com.au/") ? defaults.Channel = 'Root.FAQ' : defaults.Channel = 'Root.Website';
			
			// Do a check whether we should be requesting content from mobile channel
			(VAMD.conf.mobChannel.enable) && (VAMD.useMobChannel($) ? (defaults.Channel = VAMD.conf.mobChannel.name) : (defaults.Channel = VAMD.conf.va.Channel));
			
			var requestParams = $.extend({}, defaults);

			if(typeof params === 'object') {
				$.extend(requestParams, params);
			}
			
			if(!init) {
				if(requestParams.FAQ == 1) {
					delete requestParams.entry;
				}
			}
			else {
				init = false;
			}

			$va = $(this);
			$va.trigger('va.request', [requestParams]);
			
			// Set of params which when passed will disable caching
			var noCache = ['entry', 'startcontext'];
			
			for(keyname in requestParams) {
				if($.inArray(keyname, noCache) !== -1) {
					delete requestParams.init;
				}
			}

			va.loader('show');
			va.scroll('top');
			
			VAMD.conf.debug && console.group('[VA-INFO] Engine request')
			VAMD.conf.debug && console.log('[VA-INFO] Sending engine request. Request data: %o', requestParams);
			VAMD.conf.debug && console.groupEnd();
			
			// Attach a timestamp to request
			new Date();
			$.extend(requestParams, {'timestamp': Date.now()});
			
			var jqxhr = $.ajax({
				url: VAMD.conf.vaurl,
				dataType: 'json',
				method: 'POST',
				xhrFields: {
					withCredentials: true
				},
				data: requestParams,
				jsonpCallback: "cvcallback",
				cache: false,
				timeout: 20000 // 20 seconds
			})
			.done(function(resp) {
				that.preventAjax = false;
				VAMD.conf.state.loaded = true;
				VAMD.conf.state.typing = false;

				// Store the ident & userlogid
				$.extend(defaults, {
					ident: resp.ident,
					userlogid: resp.userlogid
				});

				$va.ident = defaults.ident;
				VAMD.conf.state.ident = defaults.ident;
				$va.userlogid = defaults.userlogid;
				$va.trigger('va.response', [resp, this]);
				
				that.firstRequest = false;
			})
			.fail(function(jqXHR, exception) {
				VAMD.util.ajaxErrorParse(jqXHR, exception);
				that.preventAjax = false;

				var $content = $('#virtual-assistant .va-content');
				var $answer = $('<div/>', {'class': 'va-ans-node'}).append($('<div/>', {'class': 'va-ans'}).append('An error has occurred. Please try asking your question again or simply reload the page.'));
				$content.append($answer);
				setTimeout(function() { 
					$content.find('.va-ans-node:last').addClass('va-is-active');
				}, 0);
				
				va.loader('hide');
				va.scroll('top');
			});
			return jqxhr;
		};
	};

	// initialize the VA
	VA.prototype.init = function(params) {
		if (!this.initEventRan) {
			$(this).trigger('va.init');
			this.initEventRan = true;
		}
		
		//var requestParams = {init: 1};
		
		var requestParams = {};
		(typeof params === 'object') && $.extend(requestParams, params);
		
		return this.request(requestParams);
	};

	// terminate the VA session
	VA.prototype.terminate = function() {
		return this.request({sessionclosed: 1});
	};

	// ask a question
	VA.prototype.ask = function(question) {
		return this.request({entry: question});
	};

	// disambiguation click
	VA.prototype.disambiguationPromptClick = function(ansNo, display) {
		return this.request({entry: display, DisambiguationOption: ansNo});
	};
	
	// load the template into DOM and initialise Flash
	VA.prototype.loadTemplate = function() {
		$('.virtual-assistant-wrapper').html($(this.template).html());
	}
	
	// create breadcrumb markup from category
	VA.prototype.makeBreadcrumb = function(category) {
		var $breadcrumb = $('<div/>');
		$breadcrumb.html('');
		var cats = category.split(".");
		$(cats).slice(0,-1).each(function(i,item) {
			$('<a/>',{
				'href': 'javascript:void(0)',
				'data-category': cats.slice(0,i+1).join('.')
			})
			.text(item.replace('Root','FAQ'))
			.appendTo($breadcrumb);
			//$breadcrumb.append(' > ');
		});
		$(cats).slice(-1).each(function(i,item) {
			$('<span/>')
			.text(item)
			.appendTo($breadcrumb);
		});
		return $breadcrumb.html();
	};

	// Create FAQ list
	VA.prototype.makeFAQ = function(resp) {
		var $faqList = $('<ul/>');
		var i = 0;
		$.each(resp.questions, function(index, node) {
			var $listItem = $('<li/>');
			if(VAMD.conf.candidateCollectionCompute)
			{
				$listItem
				.append($('<a/>',
					{
						'href': 'javascript:void(0)',
						'data-recognition-id': node.recognition_id,
						'data-dtree': node.data_dtree || 'false',
						'data-answer-id': node.answer_id,
						'data-counter': node.faqcounter || (index+1),
						'data-subtype' : node.subtype
					})
				.append(node.faqdisplay));
			}
			else
			{
				$listItem
				.append($('<a/>',
					{
						'href': 'javascript:void(0)',
						'data-recognition-id': node.recognition_id,
						'data-dtree': node.data_dtree || 'false',
						'data-answer-id': node.answer_id
					})
				.append(node.faqdisplay));
			}
			
			$faqList.append($listItem);

			/*
			// We can limit the number of FAQs displayed. Sometimes needed based on template.
			i++;
			if(i == 5) {
				return false;
			}
			*/
		});
		return $faqList.clone().wrap('<p>').parent().html();
	}
	
	// Create semantic FAQ list markup
	//
	VA.prototype.makeSemFaqs = function(resp) {
		var $semFaqs = $(resp).find('semanticfaq');
		var $list = $('<div/>', {'class': 'dtree va-faq-ul va-dtree clearfix'});
		var i = 0;

		$semFaqs.each(function(i, item) {
			if(i == 5) {
				return false;
			}
			else {
				$list
					.append($('<a/>', 
						{
							'href': 'javascript:void(0)',
							'tabindex': '1',
							'data-answer-id': $(item).find('AnswerId').text(),
							'data-dtree': 'false',
							'data-recognition-id': $(item).find('RecognitionId').text()
						})
						.append($(item).find('QuestionText').text()));
				i++;
			}
		});

		return $list.clone().wrap('<p>').parent().html();
	}
	
	// Create category dropdown markup
	//
	VA.prototype.makeDropdown = function(resp) {
		// var $dropdown = $('<select/>', {'name': 'Navcontext', 'tabindex': 0});
		// var	$option = $('<option/>');

		// $dropdown.append($('<option/>', {'value': '' , 'style': 'display: none'}).append('Select a category'));

		// $.each(resp.dropdown, function(index, node) {
			// var $option = $('<option/>', {'value': node.displaycontext, 'style': 'text-align: left'});
			// $option.append(node.displaycontext);
			// $dropdown.append($option);
		// });
		
		// var $dropdown = $('<span/>').append('Select a category');
		var $dropdown = $('<ul/>', {'name': 'Navcontext', 'tabindex': 0});
		var	$li = $('<li/>');
		
		$dropdown.append($('<p/>', {'value': '', 'class': 'menu-title'}).append('Select a category'));
		
		$.each(resp.dropdown, function(index, node) {
			var $li = $('<li/>', {'value': node.displaycontext, 'style': 'text-align: left'});
			$li.append(node.displaycontext);
			$dropdown.append($li);
		});
		
		$dropdown.append("<div class='dropdown-arrow'></div>");

		return $dropdown.clone().wrap('<p>').parent().html();
	}
	
	// Create D-tree markup 
	//
	VA.prototype.makeDTree = function(resp) {
		//var dTreeStyle   = 'ul';
		var dTreeStyle   = resp.dtreestyle;
		var	dTreeBackNav = resp.backnavflag;
		var	dTreeBackSuppress = resp.dtreeback;
		var	dtreeConnFreeText = (resp.freetextcon).split(";");
		var	connectors  = resp.connectors.Connectors;
		var	$dtree = $('<div/>', {'class': 'va-ans-opt'});
		var	imageList = false;
			
		switch(dTreeStyle) {
			case "ol":
				$dTreeList = $('<ol/>');
				break;
			case "ul":
				$dTreeList = $('<ul/>');
				break;
			default:
				$dTreeList = $('<div/>');
		}
		
		$dTreeList.addClass('dtree va-dtree');
		
		for(var i in connectors) {
			if(typeof connectors[i].DefaultClickText !== 'undefined' && connectors[i].DefaultClickText != '') {
				var connId = connectors[i].ConnectorID;
				var connText = connectors[i].DefaultClickText;
				var	connImage = connectors[i].image;
				var	$a = $('<a/>',
					{
						'href': 'javascript:void(0)',
						'class': 'va-dtree-opt',
						'data-connector-id': connId,
						'data-freetext' : $.inArray(connText, dtreeConnFreeText)
					})
					.text(connText);

				$dTreeList.is('ul,ol') ? $dTreeList.append($('<li/>').append($a)) : $dTreeList.append($a);					
			}
		}

		(imageList) && $dTreeList.addClass("va-image-list");
		
		$dtree.append($dTreeList);
		
		// Append D-tree back navigation button
		if(dTreeBackNav == '1' && !dTreeBackSuppress) {
			var $a = $('<a/>',
				{
					'class': 'dtree-back va-dtree-back',
					'href': 'javascript:void(0)'
				})
				.append('Go back');

			$dTreeList.is('ul,ol') ? $dTreeList.append($('<li/>').append($a)) : $dTreeList.append($a);
		}

		$dtree.append($dTreeList);
		
		return $dtree.html();
	};

	// Trigger ICS
	VA.prototype.triggerICS = function(icsCommand, resp) {
		var ics = window.vaics || null;
		var reICS = /^whyNotSaveCall|whyNotHelpful$/;
		if(reICS.test(icsCommand)) {
			var otherReason = resp.otherreason,
				otherReasonText = "Specify your own reason";
			(resp.otherreasontext != "") && (otherReasonText = resp.otherReasonText);
			VAMD.ics.create($, icsCommand, resp.connectors.Connectors, otherReason, otherReasonText);
		}
	};
	
	// Add ICS entry
	VA.prototype.makeICSentry = function(resp) {
		var yesIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAABEElEQVRIie3VMUoDQRTG8V8ULAQJWNgpighpBcEbiAfwEh5EWytre08gphUR7T1AvIAGQYLiWiRC3J3FibM7NvngFfN4O3/e92Z2mKteqyjwjAss5wLvT8DfcZKy2cIMtTul9UEu8G5p3UsBx2oNQz+t/sgBPi9BCwzahm5hFABfpmwaM+NTLAXyNyng33SET9VuC9VTnqxFbBvf0/caaGyM0MdGDDgFVBfXZUinBty0huhOJ2b5gaToNqaoDav3/gt8VYbkmvErVqYTuWb8EFPUtM33Avc4R8cvAg9KjhlX5kueju9iC5ucbx/rIUjbVof2R9jqziSOjV+Xv+op4VubOMMj3sRbPMBhCniuxvQFCTO1qmF9ERIAAAAASUVORK5CYII=';
		var noIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAABB0lEQVRIie3TPUoEQRDF8Z+bGfiBYOoXeAMvYewpTLyEsWBgbmjgBRRZjQSNDBXMFGPBFVQUx2CSoZmR7pmd3mQfVNBF8f7FK5qpppqQ1nCIB3ygiKxnbLeF7uIzARbW03/mMzW9ou2mkf5gMEZInS6xGjvcNtqmGtZB+o4a3jEXNvuOGm7qmjnAiyLvPO4bF7gKITluDCPMVxs5oobrmKE+ot6aFPgshOS68RsWqo1cN76NGRpgA/v41i3iL5xjJXXTHfw2mG6mmqXqpAG81zd4XRlZCD7tGwxHNeCXHOBl5Zeogn9ygOEgAI+6mKX847vgfZ8L/Bi8L7qAU7SkjPgVx5jtYvYHi+e22y/UCsYAAAAASUVORK5CYII=';
		if($('<div/>').html(resp.answer).find(".enable_external_ics").length === 0 || va.rn < 1){
			return ''
		}
		else{
			var ics_report_url = 'https://myer.aus.apac.creativevirtual.com/myer_live/ics.jsp?sessionId=' + resp.ident + '&transactionId=' + resp.transid + '&jsonIcs=%7B%22show_ics%22:%22true%22%7D'
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
			//return '<div class="ics_entry">Was this answer helpful?<div class="ics_entry_options"><a href="#" onclick="VAMD.ics.create(cvjq, \'' + resp.ident + '\', \'' + resp.transid + '\', \'yes\');">Yes</a><a href="#" onclick="VAMD.ics.create(cvjq, \'' + resp.ident + '\', \'' + resp.transid + '\', \'no\');">No</a></div></div>'
			return '<div class="ics_entry">Did this answer your question?<div class="ics_entry_options"><a href="#" onclick="VAMD.ics.create(cvjq, \'yes\',\''+ resp.ident + '\',\''+ resp.transid +'\', \'\');">'+'<img class="ics_opt_icon" src="' + yesIcon +'"/> </a><a href="#" onclick="VAMD.ics.create(cvjq, \'no\', \''+ resp.ident +'\',\''+ resp.transid +'\', \'\');"> <img class="ics_opt_icon" src="'+ noIcon +'" /> </a></div></div>'
		}
	}

	// Ajax loader animation
	VA.prototype.loader = function(param) {
		(param == 'show') ? ($('#virtual-assistant .va-loading').show()) : ($('#virtual-assistant .va-loading').hide());
	}
	
	VA.prototype.retryRequest = function(params) {
		return this.request(params);
	}

	// Legacy ask_question() function
	VA.prototype.ask_question = function(question, faqIDin, faqMainCatID, faqMainCatDesc, recognitionID, answerID) {
		var params = {
			FAQ:'1',
			FAQRequest: question,
			mainCat: faqMainCatID || va.mainCat
		};
		if(arguments.length == 6){
			$.extend(params,{
				ANSWER_ID: recognitionID, 
				RECOGNITION_ID: answerID
			});
		}
		return this.request(params);
	}
	
	// Scroll the content area
	VA.prototype.scroll = function(dir) {
		if($(window).width() >= VAMD.conf.threshold) {
			$sc = $('#virtual-assistant .va-content-wrap-in');
			switch(dir) {
				case 'top':
					$sc.scrollTop(0);
					break;
				case 'bottom':
					$sc.scrollTop(10000);
			}
		}
		else {
			switch(dir) {
				case 'top':
					$(window).scrollTop(0);
					break;
				case 'bottom':
					$(window).scrollTop(10000);
			}			
		}
	}
	
	// New bot navigation function. It opens either in the current tab or a new one.
	VA.prototype.nav = function(url, param) {
		var win = window.open(url, '_blank');
		win.focus();
		/*
		if(arguments.length > 1) {
			var win = window.open(url, '_blank');
			win.focus();
		}
		else {
			window.open(url, '_self');
		}
		*/
	}
		
	// Create the VA instance
	window.va = new VA();	

	// VA initialization
	$(va).on('va.init', function(event) {
	
		va.$wrapper = $('#virtual-assistant');
		
		// Attach to 'ask' button
		va.$wrapper
			.on('click', '.va-inp-btn', function(event) {
				if(VAMD.conf.state.enabled) {
					var question = $.trim($('.va-inp-txt').val());
					event.preventDefault();
					if(question.length > 0){
						va.request({
							entry: question,
							mainCat: va.mainCat
						});
					}
					$('.va-autocomplete').removeClass('va-show');
				}
			});
		
		// Attach 'return' key listener
		va.$wrapper
			.on('keypress', '.va-inp-txt', function(event) {
				if(event.which == 13) {
					$('.va-inp-btn').trigger('click');
					return false;
				}
			});

		// Setup click handlers for autocomplete
		va.$wrapper
			.on('click', '.va-autocomplete a', function(e) {	

				var $a = $(e.target);
				e.preventDefault();

				va.request({
					type: 'SELECT',
					selectSource: 'autocomplete',
					ANSWERLINK_ID: $a.attr('data-answer-id'), 
					RECOGNITION_ID: $a.attr('data-recognition-id'),
					entry: $a.text()
				});
				$('.va-inp-txt').val($(this).text());
				(VAMD.conf.autocomplete) && (VAMD.autocomplete.destroy($));
			});
			
		// Setup click handlers for FAQ list
		va.$wrapper
			.on('click', '.va-faqs a, .va-faq-ul a', function(e) {
				e.preventDefault();
				var $a = $(e.target);
				
				if($a.attr('data-dtree') == "True"){
					va.request({
						entry: $a.text().replace("."," "),
						mainCat: va.mainCat
					});
				}
				else{
					if(VAMD.conf.candidateCollectionCompute)
					{
						that.faqClickTime = new Date();
						var differenceClick = that.faqClickTime.getTime() - that.faqLoadTime.getTime();
						var seconds = Math.floor((differenceClick) / (1000));
					
						va.request({
							FAQ: 1,
							ANSWER_ID: $a.attr('data-answer-id'), 
							RECOGNITION_ID: $a.attr('data-recognition-id'),
							subtype: $a.attr('data-subtype'),
							FAQRequest: $a.text(),
							ClickTime:seconds,
							Position:$a.attr('data-counter')
						});
					}
					else
					{
						va.request({
							FAQ: 1,
							ANSWER_ID: $a.attr('data-answer-id'), 
							RECOGNITION_ID: $a.attr('data-recognition-id'),
							FAQRequest: $a.text()
						});
					}
				}
				
				!$(this).parent().parent().hasClass('va-faq-ul') && $('.va-related-head.va-toggle').trigger('click');
				
				(VAMD.conf.autocomplete) && (VAMD.autocomplete.destroy($));
			});

		// setup click handlers for Deep Matcher Results
		va.$wrapper
		.on('click', '.va-deep-faq', function(event) {
			var $a = $(event.target);
			event.preventDefault();
				va.request({
					type: 'SELECT',
					selectSource: 'DM',
					collect: 'true',
					RECOGNITION_ID: $a.attr('data-recid'),
					entry: $a.text().replace("."," "),
					mainCat: va.mainCat
				});
		});
			
		// setup click handlers for category breadcrumb
		va.$wrapper
			.on('click', '.va-breadcrumbs li > a:not(:last), .va-breadcrumbs > a', function(event){
				var $a = $(event.target);
				event.preventDefault();
				va.request({
					FAQ: 1,
					ButtonRequest: 'change_Context',
					navcontext: $a.attr('data-category'),
					mainCat: va.mainCat
				})
			});

		// setup click handlers for sub-category dropdown
		va.$wrapper
			.on('click', '.va-dropdown ul li', function(event){
				$('.select-faq-category').hide();
				$opt = $(event.target);
				va.request({
					FAQ: 1,
					ButtonRequest: 'change_Context',
					navcontext: [va.mainCat, $opt[0].innerText].join('.'),
					mainCat: va.mainCat
				});
			});
			
		va.$wrapper
			.on('click', '.va-dropdown', function(event){
				if($(this).hasClass('dropdown-active')){
					$(this).removeClass('dropdown-active');
				}else{
					$(this).addClass('dropdown-active');
				}
			}); 
		
		// attach click handlers
		va.$wrapper
			.on('click','.dtree-back',function(event){
				var $a = $(event.target);
				event.preventDefault();
				va.request({
					DTreeRequestType: 3,
					connector_ID: $a.attr('data-connector-id'),
					DTreeRequest: $a.text(),
					DTREE_OBJECT_ID: va.dTreeObjectId,
					DTREE_NODE_ID: va.dTreeNodeId,
					ICS_SOURCE_ANSWER_ID: va.icsSourceAnswerId
				});
			})
			.on('click', '.va-ans .dtree:last a', function(event){
				$('.dtree:last a').on('click', function() {
					return false;
				});
				var $a = $(event.target);
				event.preventDefault();
				// Free text operation
				if ($a.attr('data-freetext') >= 0) {
					va.request({
						entry: $a.text()
					})
				}
				else{
					// Normal Dree request
					va.request({
						DTreeRequestType: 2,
						connector_ID: $a.attr('data-connector-id'),
						DTreeRequest: $a.text(),
						DTREE_OBJECT_ID: va.dTreeObjectId,
						DTREE_NODE_ID: va.dTreeNodeId,
						ICS_SOURCE_ANSWER_ID: va.icsSourceAnswerId
					});
				}
			});
				
		va.$wrapper
			.on('click', '.va-gotop', function() {
				va.scroll('top');
			});
		
	});

	// VA response
	$(va).on('va.response', function(event, resp, req) {
		
		VAMD.conf.debug && console.group('[VA-INFO] Engine response');
		VAMD.conf.debug && console.log('[VA-INFO] Parsing engine response. Response data: %o', resp);
		VAMD.conf.debug && console.groupEnd();
		
		var $breadcrumbs = $('#virtual-assistant .va-breadcrumbs');
		var $content = $('#virtual-assistant .va-content');
		var $input = $('#virtual-assistant .va-inp-txt');
		var $faqs = $('#virtual-assistant .va-faqs');
		var showQuestion = (resp.question == 'LIVECHATSTART' || resp.question == 'LIVECHATEND' || (resp.question == 'change_Context' && va.firstRequest)) ? false : true;
		var $freetextdisable  = $(resp).find('freetextdisable').text();
		var isNavRequest = /ButtonRequest=change_Context/i.test(req.url);
		
		// Try to open a link if autonav is present and allowed
		if(VAMD.conf.autonav && resp.autonav.href.length > 0 && !va.firstRequest) {
			window.open(resp.autonav.href, '_self');
		}
		
		// This is for live chat testing purposes
		(resp.question == 'startchat' || resp.question == 'start chat') && (resp.answer = 'This is an example live chat launching entry point. When you click the below button, you will be asked to enter your details and then continue.');
		
		// Append previous conversation dialog if history flag is set and text is available in local storage. Clear local storage if time offset is more than 10 minutes
		if(VAMD.conf.history && va.firstRequest) {
			if(VAMD.util.getStorage('VA_SESSIONTIME') && VAMD.util.getTimeoutOffset() > 9) {
				VAMD.conf.debug && console.log('[VA-INFO] %cSession timeout reached, clearing history', 'color:#999999');
				VAMD.util.clearStorage('VA_SESSIONTIME');
				VAMD.util.clearStorage('VA_HISTORY');
			}
			
			VAMD.util.setStorage({VA_SESSIONTIME: Date.now()});
			var vaHistory = VAMD.util.getStorage('VA_HISTORY');
		}
		
		// {dtreequestion} is linked into the DTreeRequest ETV
		// If {dtreequestion} is populated then question must be overridden to make dtree clicks populate
		(resp.dtreequestion != '') && (resp.question = resp.dtreequestion);
		
		$(va).trigger('va.category.changed', [resp.maincat]);

		// Preserve the main category
		va.mainCat = resp.maincat;

		// Preserve D-Tree nodes
		va.dTreeObjectId = resp.dtreeobjectid;
		va.dTreeNodeId = resp.dtreenodeid;
		va.icsSourceAnswerId = resp.answerID;

		// update UI with new FAQ list
		$faqs.html(va.makeFAQ(resp));
		
		if(VAMD.conf.candidateCollectionCompute)
		{
			that.faqLoadTime = new Date();
		}
		
		// Superplaceholder
		if (VAMD.conf.superplaceholder.enable){
			VAMD.conf.debug && console.log('[VA-INFO] Staring the Superplaceholder on va.response');
			// Destroy the old instace if it exists
			if (VAMD.conf.superplaceholder.instance){
				VAMD.conf.superplaceholder.instance.destroy();			
			}
			// Update superplaceholder sentences
			if (VAMD.conf.superplaceholder.include_FAQ){
				current_faq_array = $("#virtual-assistant .va-faqs li").map(function(){
										return $.trim($(this).text());
									}).get();		
				VAMD.conf.superplaceholder.instance_sentences = VAMD.conf.superplaceholder.default_sentences.concat(current_faq_array).concat(VAMD.conf.superplaceholder.default_sentences)							
			} else{
				VAMD.conf.superplaceholder.instance_sentences = VAMD.conf.superplaceholder.default_sentences
			}
			// Create new instance
			VAMD.conf.superplaceholder.instance = superplaceholder({
				el: cvjq("#virtual-assistant #entry").get(0),
				sentences: VAMD.conf.superplaceholder.instance_sentences,
				options: {
					letterDelay: 70,
					sentenceDelay: 1500,
					cursor:'',
					onFocusAction: superplaceholder.Actions.NOTHING,
					onBlurAction: superplaceholder.Actions.NOTHING
				}
			});
			// Start instance
			VAMD.conf.superplaceholder.instance.start();
		}
				
		// Create breadcrumbs HTML
		$breadcrumbs.html(va.makeBreadcrumb(resp.maincat));
		
		// Hide breadcrumbs if current position is Root
		(va.mainCat == 'Root') ? $breadcrumbs.hide() && $('.select-faq-category').show() : $breadcrumbs.show();

		// update UI with new sub-category dropdown selector		
		(resp.dropdown.length != 0) ? $('.va-dropdown').show().html(va.makeDropdown(resp)) : $('.va-dropdown').hide().html(va.makeDropdown(resp));
		
		//ICS specific checks
		(resp.question == '_ics_user_cancelled_') && (resp.question = 'ICS closed');
		(resp.question == '_ics_no_reason_given_') && (resp.question = 'No reason was given');
		
		if(isNavRequest) {
			resp.question = va.question;
			resp.answer = va.answer;
		}
		else {
			if(VAMD.conf.history && va.firstRequest && vaHistory != false) {
				$content.append(vaHistory).scrollTop(9999);
			}		
			else {
				if(showQuestion) {
					if((va.firstRequest && resp.question != '') || (!va.firstRequest)) {
						if(VAMD.conf.convScroll) {
							// var objDate = new Date(),
							// locale = "en-AU"
							// time = objDate.toLocaleString(locale, { hour12: false, hour: '2-digit', minute: '2-digit' }),
							// day = objDate.toLocaleString(locale, { day: "numeric" }),
							// month = objDate.toLocaleString(locale, { month: "short" }),
							// year = objDate.toLocaleString(locale, {year: "numeric"}),
							// hours = objDate.getHours(),
							// minutes = objDate.toTimeString().slice(3,5);
							
							// var $datetime = $('<div/>', {'class': "va-int-lbl"}).text('You ').append($('<span/>', {'class': "va-int-date"}).text( time + ',' + day + ' ' + month + ' ' + year))
							// var $question = $('<div/>', {'class': 'va-qst-node'});
							// var $qst = $('<div/>', {'class': 'va-qst'});
							
							// $question.append($qst)
							// $content.append($datetime);
							// $content.append($question);
							
							// $qst.append($("<span />", {"class" : "qst-timestamp"}).text(hours + ':' + minutes));
							// $qst.append( $('<div/>', {'class': 'va-qst-text'}).append(resp.question));
							
							var $question = $('<div/>', {'class': 'va-qst-node'});
							$question
								.append($('<div/>', {'class': 'va-qst'})
									.append(resp.question));
							
							$content.append($question);
							setTimeout(function() { 
								$content.find('.va-qst-node:last').addClass('va-is-active');
							}, 0);
						}
						else {
							$('.va-qst').html(resp.question);
							$('.va-qst-wrap').show();					
						}
					}
				}
				/*
				else {
					showQuestion = true;
				}
				*/
				
				if(VAMD.conf.convScroll) {
					// if(window.location.href == 'https://www.dev.aws.myer.com.au/' && cvjq('.va-qst-node')[0] === undefined){
					if(window.location.href == 'https://www.myer.com.au/content/faq' && cvjq('.va-qst-node')[0] === undefined){
						resp.answer = "Hi, I can see that you are looking at our FAQs, I&rsquo;m a Virtual Agent, not a real person, but I know lots about Myer.<br/><br/>Try asking me the question, and will see if I can find the answer for you.";
					}
					
					var $answer = $('<div/>', {'class': 'va-ans-node'});
					$answer
						.append($('<div/>', {'class': 'va-ans'})
							.append(resp.answer + va.makeDTree(resp) + va.makeICSentry(resp)));
					
					// This is for for live chat testing purposes
					(resp.question == 'startchat' || resp.question == 'start chat') && ($answer.children().append($('<a/>', {'class': 'va-cta-link', 'href': 'javascript:void(0)', 'title': '', 'onclick': 'VAMD.lc.offerLiveChat()'}).append('Start live chat'))) && (VAMD.conf.livechat.state.modalCred = false);
					
					// If Genesys Chat should be offered:
					if (resp.purecloudtrigger === 'true') {
						if (resp.purecloudqueue) {
						  VAMD.conf.debug && console.log(resp.purecloudqueue);
						  VAMD.conf.purecloudchat.service.QUEUE_NAME = resp.purecloudqueue;
						}
						if (resp.pureclouddata) {
						  VAMD.conf.debug && console.log(resp.pureclouddata);
						  VAMD.conf.purecloudchat.user = resp.pureclouddata
						  
						  $answer.find('.va-ans').append(
							$('<a/>', {
							  class: 'va-cta-link',
							  href: 'javascript:void(0)',
							  title: '',
							  onclick: 'VAMD.pcc.startLiveChat()'
							}).append(VAMD.conf.purecloudchat.msg.stat14)
						  );
						} else {
						  $answer.find('.va-ans').append(
							$('<a/>', {
							  class: 'va-cta-link',
							  href: 'javascript:void(0)',
							  title: '',
							  onclick: 'VAMD.pcc.offerLiveChat()'
							}).append(VAMD.conf.purecloudchat.msg.stat14)
						  );
						}
					}
					
					$content.append($answer);
					
					setTimeout(function() { 
						$content.find('.va-ans-node:last').addClass('va-is-active');
						VAMD.conf.history && VAMD.util.setStorage({VA_HISTORY: $('.va-content').html()});
					}, 0);
				}
			}
		}
		
		// Trigger ICS
		 va.triggerICS(resp.showicsoverlay, resp);

		// Preserve question and answer
		va.question = resp.question;
		va.answer = resp.answer;
		
		// Clear the input field
		$input.val('');
		
		//!va.firstRequest && $input.blur();
		//($(window).width() > VAMD.conf.threshold) && $input.focus();
		($(window).width() > VAMD.conf.threshold) ? $input.focus() : $input.blur();

		(showQuestion && resp.question.length > 0 && resp.question != 'change_Context') && $content.scrollTop($content.scrollTop() - $content.offset().top + $('.va-qst-node:last').offset().top - 10);

		// Increment request number count
		va.rn++;
		
		va.loader('hide');
		
		// Myer Live Chat User Form
		if(['578'].includes(resp.answerID)){
			userFormHTML = `<div class="lc-modal-wrap">
<div class="lc-user-modal"><a href="javascript:void(0)" title="" class="lc-modal-close"></a>
<form onsubmit="submitModal();"><div style="display:flex;flex-direction:column;">
<h2>Please fill in your details</h2>
<label>First Name: </label><input class="inp-ics" name="engagementsFirstName" type="text" required /> <label>Last Name: </label><input class="inp-ics" name="engagementsLastName" type="text" required /> <label>Phone: </label><input class="inp-ics" name="engagementsPhone" type="text" required /> <label>Email: </label><input class="inp-ics" name="engagementsEmail" type="text" required /> <label>MYER One Member ID/Order ID: </label><input class="inp-ics" name="engagementsOrderID" type="text" required />
<div style="display:flex;flex-direction:row;align-items:center;justify-content:center;margin:20px;"><button class="modal-submit-btn" style="margin-right:10px;">Submit</button><button class="modal-close-btn" style="margin-left:10px;">Close</button></div>
</div>
</form>
</div>
</div>`
			
			var $modal = $($.parseHTML(userFormHTML));
			
			$('.va-wrap')
			.append($('<div/>', {'class': 'va-modal-shadow'}))
			.append($modal);
		}
	});

})(cvjq);




// mobile resizing when the keyboard is active
window.addEventListener('resize', function() {
	if(/Android/i.test(navigator.userAgent)) { // we're checking whether it's a mobile device based on user agent string

		// portrait mode
		if(window.innerHeight > window.innerWidth){
			if(window.innerHeight < 500){
				// console.log('keyboard activated portrait');
				cvjq('.va-trigger').hide();
			}else{
				// console.log('keyboard deactivated portrait');
				cvjq('.va-trigger').show();
			}
		}else{  // landscape mode
			if(window.innerHeight < 200){
				// console.log('keyboard activated landscape');
				cvjq('.va-trigger').hide();
			}else{
				// console.log('keyboard deactivated landscape');
				cvjq('.va-trigger').show();
			}
		}
	}
});


window.addEventListener('mousedown',function(){
    //console.log('click is invoked');
    var navOpenBtn = document.getElementById('nav-open-btn');
    var observer = new MutationObserver(function(mutations) {
        if(navOpenBtn.getAttribute('aria-expanded') == 'false'){cvjq('.va-trigger').show();}
        else if(navOpenBtn.getAttribute('aria-expanded') == 'true'){cvjq('.va-trigger').hide();}
    });
	if(navOpenBtn != null && typeof navOpenBtn == 'object'){
		observer.observe(navOpenBtn, { 
        attributes: true, 
        attributeFilter: ['aria-expanded'] });
	}
    
});

(function(history) {
    var pushState = history.pushState;
    history.pushState = function(state) {
        if (typeof history.onpushstate == "function") {
            history.onpushstate({
                state: state
            });
        }
        return pushState.apply(history, arguments);
    }
})(window.history);

window.onpopstate = history.onpushstate = function(e) {
    // console.log('history has changed');
	
    
    setTimeout(()=>{
		self.VAMD.CVHideVAWindow.init();		
        // console.log('The curent url is '+ window.location.href);
        current_url = new URL(window.location.href);
		let check_bag_url = new URL("https://www.myer.com.au/bag");
        if((current_url.pathname.includes('/p/') || (window.location.href.includes(check_bag_url)))&& (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))){
            cvjq('.va-trigger').attr('style','bottom: 100px !important');}
		else{cvjq('.va-trigger').attr('style','bottom: 10px !important');}
		
		if(current_url.href == 'https://www.myer.com.au/content/faq'){
			cvjq(VAMD).trigger('va.open',[{businessArea: 'Root', Channel: 'Root.Website'}]);
		}
    },1);
	
    // console.log(e);
};

function submitModal() {
	var modal = cvjq('.lc-modal-wrap');
	var submitBtn = cvjq('.modal-submit-btn');
	if (modal) {
		firstName = cvjq('input[name="engagementsFirstName"]').val();
		lastName = cvjq('input[name="engagementsLastName"]').val();
		emailAddress = cvjq('input[name=engagementsEmail]').val();
		phoneNumber = cvjq('input[name=engagementsPhone]').val();
		orderID = cvjq('input[name=engagementsOrderID]').val();
		// myeroneID = cvjq('input[name=engagementsID]').val();
		
		cvjq(va.request({
			entry: "Connecting to Myer live chat",

			data: {
				"firstName": firstName,
				"lastName": lastName,
				"emailAddress": emailAddress,
				"phone": phoneNumber,
				"orderID": orderID
				// "myeroneID": myeroneID
			}

		}));
		cvjq('.modal-close-btn').click();
	};


}
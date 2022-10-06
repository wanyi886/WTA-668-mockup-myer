'use strict';

VAMD.conf.purecloudchat = {
  scripts: ['pcc_client.js'],
  service: {
    // ORGANIZATION_ID: 'b017ce53-1044-4749-a3ef-45aa69cbf15d', // Admin > Account Settings > Organization Settings
	ORGANIZATION_ID: 'bb171c3a-5849-4e8c-a678-9caff92ed396',   // Myer
    // DEPLOYMENT_ID: '4fa7c966-bbed-4c7e-9541-728f0b921e70', // Admin > Contact Center > Widgets
	DEPLOYMENT_ID: '83768780-6ab8-46a6-9d5c-a5efe5cf0614',    // Myer
	
    // QUEUE_NAME: 'Myer Chat Staging', // Admin > Contact Center > Queues
	QUEUE_NAME: 'Myer Chat Staging',
    GUEST_IMAGE: 'https://myer.aus.apac.creativevirtual.com/myer_staging_ui/images/user.svg',
    DEFAULT_IMAGE: 'https://myer.aus.apac.creativevirtual.com/myer_staging_ui/images/chatbot-logo.svg'
  },
  lcwrapper: '.va-lc-content',
  config: {
    userSessionTimeout: 300,
    showPrompt: true, // Do we show quit live chat prompt dialog
    returnToVa: true // Should we hand back to the VA?
  },
  state: {
    modalCred: false, // is the user info modal being shown
    isActive: false, // is the PureCloud chat currently active
    scriptsLoaded: false, // Script loaded? Have LC scrips been loaded?
	wsError: false // check the websocket is in error state e.g. on IOS device.
  },
  msg: {
    waitForAgent: 'Please wait whilst we connect you to an agent...',
    isTypingMessage: ' is typing ...',
    agentJoinedMessage: 'You are now connected to ',
    agentLeftMessage: ' has left the session.',
    clientLeftMessage: 'You have left the session.',
    sessionEndedMessage: 'Chat session ended.',
    stat01: 'Are you sure you want to quit live chat?',
    stat02: 'To continue to live chat, please enter your details',
    stat03: 'Yes',
    stat04: 'No',
    stat05: 'Cancel',
    stat06: 'First Name',
    stat07: 'Last Name',
    stat08: 'Email address',
    stat09: 'Subject',
    stat10: 'Submit',
    stat11: 'Please enter all required details and try again',
    stat12: 'Quit chat',
    stat13: 'Click here to quit live chat',
    stat14: 'Start live chat'
  },
  vaStartupData: {
    // Live chat startup data object
    User: {
      FirstName: '',
      Surname: '',
      Email: ''
    }
  },
  user: {
    firstName: '',
    lastName: '',
    emailAddress: '',
	orderID: '',
	phone: '',

  },
  history: true
};

VAMD.pcc = (function() {
  var self = {};

  // Prepare VA interface
  var prepareVAInterface = function($, callback) {
    VAMD.conf.debug && console.log('[GC-INFO] Preparing virtual assistant interface');

    var $va = $('#virtual-assistant');

    // set the header info:
    // cvjq('#va-agent-name').text('Jo');
    // cvjq('#va-agent-status').text('Virtual');

    $va.removeClass('va-lc');
    $va.find('.va-content').show();
    $va.find('.va-lc-content').remove();

    $va.find('.va-related').show();

    /*
		//cvjq('#virtual-assistant').removeClass('va-live-chat');
        cvjq('#virtual-assistant').removeClass('va-lc');
		
		cvjq('#virtual-assistant .va-content').show();
		cvjq('#virtual-assistant .valc-body-wrap').hide();
		cvjq('#virtual-assistant .valc-body').html('');
		
		cvjq('#virtual-assistant .faq_btn').show();
		
		cvjq('.va-clm-left').removeAttr('style');
		cvjq('#virtual-assistant .va-lc-notification').remove();
    */

    callback && callback();
  };

  // Prepare Genesys PureCloud Chat interface
  var preparePCCInterface = function($, callback) {
    VAMD.conf.debug && console.log('[GC-INFO] Preparing Genesys PureCloud Chat interface');

    var $va = cvjq('#virtual-assistant');

    $va.addClass('va-lc');
    $va.find('.va-content').hide();
    $va.find('.va-body').append(
      cvjq('<div/>', {
        class: 'va-lc-content'
      })
    );

    // add the Quit chat button
    // $va.find('.va-lc-content').append(
      // cvjq('<a/>', {
        // href: 'javascript:void(0)',
        // title: VAMD.conf.purecloudchat.msg.stat13,
        // class: 'va-lc-quit'
      // }).append(VAMD.conf.purecloudchat.msg.stat12)
    // );
	$va.find('.va-header.clearfix').append(
      cvjq('<a/>', {
        href: 'javascript:void(0)',
        title: VAMD.conf.purecloudchat.msg.stat13,
        class: 'va-lc-quit'
      }).append("End live chat")
    );
	
	// $va.find('.va-toggle-faq').hide();

    // hide the related FAQs button
    $va.find('.va-related').hide();

    callback && callback();
  };

  // Initialise Genesys PureCloud Chat
  self.startPCCChat = function($, testing) {
    VAMD.conf.debug && console.group('[GC-INFO] Resource loading');

    VAMD.conf.state.ls = 2;

    if (!VAMD.conf.purecloudchat.state.scriptsLoaded) {
      VAMD.requiredScripts(VAMD.conf.purecloudchat.scripts, function() {
        VAMD.conf.debug && console.groupEnd();
        VAMD.conf.debug && console.log('[GC-INFO] %cAll scripts were successfully loaded', 'color:#01ab4d');

        // Additional step for stats purposes
        // va.request({ entry: 'LIVECHATSTART' });

        VAMD.conf.purecloudchat.state.scriptsLoaded = true;

        // Disable VA engine requests
        VAMD.conf.state.enabled = false;
        VAMD.conf.state.mode = 2;

        preparePCCInterface($, function() {
          !testing ? cvjq('#virtual-assistant').trigger('GPCChatConnect') : self.showTestMessages();
        });
      });
    } else {
      preparePCCInterface($, function() {
        VAMD.conf.state.enabled = false;
        VAMD.conf.state.mode = 2;
        cvjq('#virtual-assistant').trigger('GPCChatConnect');
      });
    }
  };

  // Live chat init function, enables event listeners, checks if already active
  self.init = function($) {
    VAMD.conf.debug && console.log('[VA-INFO] %cEnabling [GENESYS CHAT]', 'color:#F84586');
    self.events($);
    self.isActive($);
  };
  
  self.checkWSHearbeat = function () {
	  console.log('[PCC-INFO] checking the ws heartbeat');
	  VAMD.util.debounce(function(){
		  console.log('[PCC-INFO] Setting heartbeat to false');
		  VAMD.conf.purecloudchat.state.wsHeartbeat = false;
	  },15);
  };
  
  self.reconnectWS = function () {
	   let isActive = !!VAMD.util.getStorage('PCC_DATA');
	   // VAMD.conf.purecloudchat.state.isActive = !!VAMD.util.getStorage('PCC_DATA');
	   VAMD.conf.debug && console.log(
        '[PCC-INFO] %cChecking if [PURECLOUD CHAT] is already active: ' + VAMD.conf.purecloudchat.state.isActive,
        'color:#F84586'
      );
      // If PureCloud is already active and within 10 mins...
      
	  if (isActive && VAMD.util.getStorage('PCC_CHAT_TIME')) {
		  const started = VAMD.util.getStorage('PCC_CHAT_TIME');
		  const curr = Math.round(Date.now() / 1000);
		  if (curr - started <= 600) {
			  VAMD.conf.debug && console.log('[PCC-INFO] %cWithin time limit so continuing with resume','color:#F84586');
			  VAMD.conf.purecloudchat.state.isActive = !!VAMD.util.getStorage('PCC_DATA');
			  PureCloud_Chat.resumeChat();
      } else {
        VAMD.util.clearStorage('PCC_DATA');
        VAMD.util.clearStorage('PCC_CHAT_TIME');
        VAMD.util.clearStorage('PCC_CHAT_HISTORY');
		    VAMD.util.clearStorage('PCC_LATEST_MSG_ID');
      }
    }
  }
  
  

  // Check is GC is already active
  self.isActive = function () {
	  let isActive = !!VAMD.util.getStorage('PCC_DATA');
    // VAMD.conf.purecloudchat.state.isActive = !!VAMD.util.getStorage('PCC_DATA');
    VAMD.conf.debug &&
      console.log(
        '[PCC-INFO] %cChecking if [PURECLOUD CHAT] is already active: ' + VAMD.conf.purecloudchat.state.isActive,
        'color:#F84586'
      );
    // If PureCloud is already active and within 10 mins...
    if (isActive && VAMD.util.getStorage('PCC_CHAT_TIME')) {
      const started = VAMD.util.getStorage('PCC_CHAT_TIME');
      const curr = Math.round(Date.now() / 1000);
      if (curr - started <= 600) {
	      VAMD.conf.debug && console.log('[PCC-INFO] %cWithin time limit so continuing with resume','color:#F84586');
		  VAMD.conf.purecloudchat.state.isActive = !!VAMD.util.getStorage('PCC_DATA');
          self.startPCCChat($, false);
      } else {
        VAMD.util.clearStorage('PCC_DATA');
        VAMD.util.clearStorage('PCC_CHAT_TIME');
        VAMD.util.clearStorage('PCC_CHAT_HISTORY');
		    VAMD.util.clearStorage('PCC_LATEST_MSG_ID');
      }
    }
  };

  self.events = function($) {
    var $vawrap = $('#virtual-assistant');
	
	// $vawrap.on('GPCReconnectWS', function() {
		// if(VAMD.conf.purecloudchat.state.scriptsLoaded && VAMD.util.getStorage('PCC_DATA')) PureCloud_Chat.resumeChat();
	// });
    $vawrap.on('GPCChatConnect', function() {
      VAMD.conf.debug && console.log('[VA-INFO] %cTriggering Genesys Chat', 'color:green');

      var va_attributes = {};

      if (!VAMD.conf.purecloudchat.state.isActive) {
        va_attributes = {
          firstName: VAMD.conf.purecloudchat.user.firstName != '' ? VAMD.conf.purecloudchat.user.firstName : "CV_FirstName",
          lastName: VAMD.conf.purecloudchat.user.lastName != '' ? VAMD.conf.purecloudchat.user.lastName : "CV_LastName",
		  emailAddress: VAMD.conf.purecloudchat.user.emailAddress != '' ? VAMD.conf.purecloudchat.user.emailAddress : "CV_EmailAddress",
		  orderId: VAMD.conf.purecloudchat.user.orderID != '' ? VAMD.conf.purecloudchat.user.orderID : "CV_OrderID",
		  phone: VAMD.conf.purecloudchat.user.phone != '' ? VAMD.conf.purecloudchat.user.phone : "CV_PhoneNumber",
		  // myeroneID: VAMD.conf.purecloudchat.user.myeroneID != '' ? VAMD.conf.purecloudchat.user.myeroneID : "",
		  
          ident: VAMD.conf.state.ident.length > 0 ? VAMD.conf.state.ident : ''
        };

        PureCloud_Chat.init({
          userSessionTimeout: VAMD.conf.purecloudchat.config.userSessionTimeout
        });
      }

      // resume chat or start a new session
      if (VAMD.util.getStorage('PCC_DATA')) {
        PureCloud_Chat.resumeChat();
      } else {
        PureCloud_Chat.startChat(va_attributes);
      }
    });

    // Send message event
    $vawrap.on('click', '.va-inp-btn', function(e) {
      if (!VAMD.conf.state.enabled && VAMD.conf.state.mode == 2) {
        var $input = $('#virtual-assistant .va-inp-txt');
        PureCloud_Chat.sendMessage($input.val());
        $input.val('');
        $(e.currentTarget)
          .parent()
          .data('composing', false);
      }
    });

    // Keypress event on Input box
    $vawrap.on('keypress', '.va-inp-txt', function(e) {
      if (!VAMD.conf.state.enabled && VAMD.conf.state.mode == 2) {
        if (e.which !== 13) {
          var composing = $(e.currentTarget)
            .parent()
            .data('composing');
          if (!composing) {
            PureCloud_Chat.setTypingIndicator();
            $(e.currentTarget)
              .parent()
              .data('composing', true);
          }
        }
		else{
			$('.va-inp-btn').trigger('click');
		}
      }
    });

    $vawrap.on('blur', '.va-inp-txt', function(e) {
      if (!VAMD.conf.state.enabled && VAMD.conf.state.mode == 2) {
        var composing = $(e.currentTarget)
          .parent()
          .data('composing');
        if (composing) {
          // PureCloud_Chat.setTypingIndicator();
          $(e.currentTarget)
            .parent()
            .data('composing', false);
        }
      }
    });

    // Offer live chat
    $(VAMD).on('vagc.offer', function() {
      VAMD.conf.debug && console.log('[GC-INFO] Offering Genesys Chat');
      self.showUserInfoDialog($);
    });

    // Start Live Chat
    $(VAMD).on('vagc.init', function() {
      VAMD.pcc.startPCCChat($, false);
    });

    // Start Live Chat testing
    $(VAMD).on('vagc.test', function() {
      VAMD.pcc.startPCCChat($, true);
    });

    // Quit live chat
    $(VAMD).on('vagc.exit', function() {
      VAMD.conf.state.mode == 2 && VAMD.conf.purecloudchat.state.isActive == true && PureCloud_Chat.stopChat();
      VAMD.conf.purecloudchat.state.isActive = false;
      //VAMD.util.appendModeStorage('va');

      // Additional step for stat purposes
      // va.request({ entry: 'LIVECHATEND' });

      // Make purecloudchat false
      if (VAMD.conf.purecloudchat.config.returnToVa) {
        prepareVAInterface($);
        // Enable VA engine requests
        VAMD.conf.state.enabled = true;
        VAMD.conf.state.mode = 1;
        VAMD.util.clearStorage('VA_GC_ACTIVE');
		$('#virtual-assistant')
          .find('.va-lc-quit')
          .remove();
		//cvjq(VAMD).trigger(ask_question('End live chat','','','','',''));
		ask_question('End live chat','','','','','');
		
      } else {
        VAMD.util.clearStorage('VA_OPEN');
        VAMD.util.clearStorage('VA_HISTORY');
        VAMD.util.clearStorage('VA_SESSIONTIME');
        VAMD.conf.state.mode = 0;
        $('#virtual-assistant')
          .find('.va-lc-quit')
          .remove();
        $('#virtual-assistant')
          .find('.va-inp-txt')
          .hide();
        $('#virtual-assistant')
          .find('.va-inp-btn')
          .hide();
      }
    });

    // Quit chat button event
    $vawrap.on('click', '.va-lc-quit', function() {
      if (VAMD.conf.state.mode === 2) {
        VAMD.conf.purecloudchat.config.showPrompt ? VAMD.pcc.showClosePrompt(cvjq) : cvjq(VAMD).trigger('vagc.exit');
      }
    });

    // Option select in LC prompt dialog
    $vawrap.on('click', '.va-lc-prompt-options a', function() {
      if ($(this).hasClass('va-lc-prompt-yes')) {
        VAMD.util.removeModalWindow($, function() {
          $(VAMD).trigger('vagc.exit');
        });
      } else {
        VAMD.util.removeModalWindow($);
      }
    });

    // Option to submit user data or cancel
    $vawrap.on('click', '.va-lc-user-dialog a', function() {
      if ($(this).hasClass('va-lc-cred-submit')) {
        //var user = new Array();
        var user = {
          name: '',
          surname: '',
          email: '',
          subject: ''
        };
        var i = 0;
        var cont = true;

        $('.va-lc-user-dialog input').each(function() {
          if ($.trim($(this).val()).length == 0) {
            $(this).addClass('va-modal-error');
            cont = false;
          } else {
            $(this).removeClass('va-modal-error');

            if ($(this).attr('name') == 'lcname') {
              user.name = $(this).val();
            } else if ($(this).attr('name') == 'lcsurname') {
              user.surname = $(this).val();
            } else if ($(this).attr('name') == 'lcemail') {
              user.email = $(this).val();
            } else if ($(this).attr('name') == 'lcsubject') {
              user.subject = $(this).val();
            }
          }
        });

        if (cont) {
          var ident =
            typeof $va !== 'undefined' && $va.ident !== 'undefined'
              ? $va.ident
              : Math.random()
                  .toString(36)
                  .slice(2);

          //self.liveChatHandover(ident, user[0], user[1], user[2], VAMD.conf.livechat.session.CustomerID, VAMD.conf.livechat.session.QueueID, VAMD.conf.livechat.session.QueueName);
          //self.liveChatHandover(ident, user[0], 'UserSurname', Date.now(), VAMD.conf.livechat.session.CustomerID, VAMD.conf.livechat.session.QueueID, VAMD.conf.livechat.session.QueueName);
          self.liveChatHandover(ident, user);

          VAMD.util.removeModalWindow($);
          VAMD.conf.purecloudchat.state.modalCred = false;
        }
      } else {
        // User clicked cancel
        VAMD.conf.debug && console.log('[GC-INFO] Closing offer live chat dialog');
        VAMD.util.removeModalWindow($);
        VAMD.conf.purecloudchat.state.modalCred = false;
      }
    });
  };

  self.offerLiveChat = function() {
    VAMD.conf.debug && console.log('[GC-INFO] Showing offer PureCloud chat dialog');
    self.showUserInfoDialog($);
  };

  self.startLiveChat = function() {
    VAMD.conf.debug && console.log('[GC-INFO] Starting PureCloud chat');
	if(document.querySelector('.va-cta-link')){
		let liveChatButton = document.querySelector('.va-cta-link');
		liveChatButton.style.background = '#cccccc';
	}else{
		console.log('Live Chat starts due to VA not responding');
	}

    self.startPCCChat($, false);
  };

  // Invoke prompt modal dialog: Are you sure you want to quit LC?
  self.showClosePrompt = function($) {
    VAMD.util.createModalWindow($, 'va-lc-prompt-dialog', true, function() {
      var $title = $('<h3/>', {
        class: 'va-modal-title'
      }).append(VAMD.conf.purecloudchat.msg.stat01);
      var $buttonY = $('<a/>', {
        href: 'javascript:void(0)',
        title: '',
        class: 'va-lc-prompt-yes va-modal-action-button'
      }).append(VAMD.conf.purecloudchat.msg.stat03);
      var $buttonN = $('<a/>', {
        href: 'javascript:void(0)',
        title: '',
        class: 'va-lc-prompt-no va-modal-action-button'
      }).append(VAMD.conf.purecloudchat.msg.stat04);
      $('.va-modal')
        .append($title)
        .append(
          $('<div/>', {
            class: 'va-lc-prompt-options clearfix'
          })
            .append(
              $('<div/>', {
                class: 'va-modal-2-col'
              }).append($buttonY)
            )
            .append(
              $('<div/>', {
                class: 'va-modal-2-col'
              }).append($buttonN)
            )
        );
    });
  };

  return self;
})();

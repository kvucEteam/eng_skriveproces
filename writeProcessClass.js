//################################################################################################################
// 
// 				FUNKTIONER TIL NY TYPE SKRIVEGUIDE, STYRET AF JSON	-	21/6-2017
//
//################################################################################################################

// Køb en portokode med Postnords mobil porto app
// https://www.youtube.com/watch?v=a7eAlaJEFsQ


writeProcessClass = {

    api: {
        selector: '#interface', // The default selector of a tag in which the quiz is generated.
        currentStepNo: 0, // The current step the student is in. 
        microhint: {
            fadeOut: 400 // The time in milliseconds it takes for the microhint to fadeout. 
        },
        // step: []		  	// The data associated with each step. 
        userData: {}, // The data collected. Data is stored with the element id (e.g. textarea id) as key, and the associated value as value. The reason why classes are not choosen as keys is because only one classname can be used for that element, if arbitrary classnames are allowed (assuming no delimited classnames like "dataKey_myClassName"). This then serverely limits the styling-possibilities for elements that need to data saved...
        saveInterval: 2000, // When an inputfield or a textarea gets focus, the data is saved at each saveInterval (in milliseconds). 
        jsonData: null, // In case the base/original jsonData is altered, the new/modified jsonData get to bestored here. This new/modified jsonData is used in localStorage. 
        insertRotateCheckOnMobileDevices: true
    },

    wpObj: { // Internal system variables. 
        // currentStepNo: 1,   // The current step the student is in.  
        eventLookup: { 'onClick': 'click touchend' }, // This "translates" diffrent event-names into JQuery standard event-names. 
        err_eventTriggered: false // This is true if an error event is triggered. 
    },

    init: function() {


        if (arguments.length > 0) {
            this.api.selector = arguments[0];
        }

        var urlObj = ReturnURLPerameters(); // From shared_functions.js 
        if (urlObj.hasOwnProperty('step')) {
            this.api.currentStepNo = parseInt(urlObj.step);
        }
        this.main();

        this.static_setEventListener(); // Only set eventlitsners once... 

        saveTimerUsrMsg(); // initialize the saveTimerUsrMsg from shared_functions.js 

        console.log('init - api: ' + JSON.stringify(this.api));

        // if (this.api.insertRotateCheckOnMobileDevices) {	
        // 	console.log('init - insertRotateCheckOnMobileDevices: TRUE'); 
        // 	rotateCheck();
        // }
    },


    main: function() {
        console.log('main - CALLED');
        // console.log('init - jsonData: ' + JSON.stringify(jsonData, null, 4)); 
        console.log('main - jsonData: ' + JSON.stringify(jsonData));
        console.log('main - Object.keys(jsonData): ' + Object.keys(jsonData));

        this.delay_remove(); // Remove previous delay if set... 
        $('.microhint').remove(); // Remove all previous microhints if any... 

        if (typeof(DTO) !== 'undefined') {
            console.log('main - DTO');
            DTO.stopExec(0); // VIRKER IKKE 
            // DTO = undefined;  // VIRKER IKKE 
        }

        jsonData = this.jsonPreProcessor(jsonData);

        // var HTML = this.generateStepContent(this.api.currentStepNo); 
        var stepObj = jsonData.step[this.api.currentStepNo];
        var HTML = this.generateStepContent(stepObj);
        console.log('main - HTML: ' + HTML);
        $(this.api.selector).html(HTML);

        // this.static_setEventListener(); 

        this.err_removeAllEventListeners(); // Remove all previous eventListeners from the previous step, before setting new ones... 
        this.err_setEventListener(); // Set error eventListeners 
        // this.err_removeAllEventListeners(); // TEST 

        this.onClick_removeAllEventListeners();
        this.onClick_setEventListener(); // Set onClick eventListeners 
        // this.onClick_removeAllEventListeners(); // TEST 

        this.getData(); // This fetches api.userData from previous steps and inserts it in the JSON data. 
        this.html();
        // this.repeat_make();   // COMMENTED OUT 17/10-2017 

        this.wpObj.jsonData_sanitized = JSON.parse(JSON.stringify(jsonData)); // Add a copy of jsonData in wpObj. 
        this.wpObj.jsonData_sanitized = this.removeAllJsonStrValues(this.wpObj.jsonData_sanitized); // Remove all string values. 

        console.log('main - jsonData_sanitized: ' + JSON.stringify(this.wpObj.jsonData_sanitized));
        console.log('main - jsonData: ' + JSON.stringify(jsonData));

        // this.err_removeAllEventListeners();  // <---- OK 4/7-2017

        // this.generateContentType('text', 'test');

        var stepObj = jsonData.step[this.api.currentStepNo];
        if (stepObj.hasOwnProperty('onStepReady')) {
            this.onStepReady(stepObj.onStepReady);
        }
    },


    onStepReady: function(onStepReadyObj) {
        console.log('\nonStepReady - CALLED');

        var func, argObj;

        for (var n in onStepReadyObj) {

            if (typeof(onStepReadyObj[n]) === 'object') {
                console.log('onStepReady - A0');

                func = String(Object.keys(onStepReadyObj[n]));
                argObj = onStepReadyObj[n][func];
                console.log('onStepReady - func: ' + func + ', argObj: ' + JSON.stringify(argObj) + '');

                if (func == 'external_function') {
                    console.log('onStepReady - A1');

                    this.externalFunctionCaller(argObj);

                } else {
                    console.log('onStepReady - A2');

                    try {
                        console.log('onStepReady - A3');

                        eval('argObj=' + JSON.stringify(argObj));
                        eval('this.' + func + '(argObj)');
                    } catch (err) {
                        console.log('onStepReady - A4');

                        // alert('ERROR: \n\tonStepReady - currentStepNo: ' + this.api.currentStepNo + ', eval('+func+'()) has an error!');
                        console.log('\n==================\n\tERROR: \n\tonStepReady - currentStepNo: ' + this.api.currentStepNo + ', eval(' + func + '()) has an error! \n==================\n');
                    }
                }
            }

            if (typeof(onStepReadyObj[n]) === 'string') { // save() is currently the only method that can be called this way... 
                console.log('onStepReady - A5');

                var c = this.cmdStrToCmdAndArg(onStepReadyObj[n]);
                var func = c.cmd;
                console.log('onStepReady - func: ' + func + ', c.arg: ' + c.arg);

                try {
                    console.log('onStepReady - A6');

                    eval('argObj=' + JSON.stringify(c.arg));
                    eval('this.' + func + '(argObj)');
                } catch (err) {
                    console.log('onStepReady - A7');

                    // alert('ERROR: \n\tonStepReady - currentStepNo: ' + this.api.currentStepNo + ', eval('+func+'()) has an error!');
                    console.log('\n==================\n\tERROR: \n\tonStepReady - currentStepNo: ' + this.api.currentStepNo + ', eval(' + func + '()) has an error! \n==================\n');
                }
            }
        }

        var header = "Online notes"; //$("h1").html();
        if (this.api.currentStepNo < 6) {
        	//alert("hvor mange gange?")
			$("h1").html("Module 1: " + header + " for chapter 1-4");
        } else if (this.api.currentStepNo > 5 && this.api.currentStepNo < 11) {
            $("h1").html("Module 2: " + header + " for chapter 5");
        } else if (this.api.currentStepNo > 10 && this.api.currentStepNo < 14) {
            $("h1").html("Module 3: " + header + " for chapter 6-8");
        } else{
        	$("h1").html(header + " - Final review");
        }

        //$("h1").html("HEJ"); //("currentStepNo: " + this.api.currentStepNo);
    },


    dynamicText: function(obj) {
        console.log('\ndynamicText - CALLED');

        $(obj.selector).append('<span id="dynamicText"></span><span class="cursor">|</span>');

        if (obj.hasOwnProperty('options')) {
            console.log('dynamicText - A0');

            var keyArr = Object.keys(obj.options);
            for (var n in keyArr) {
                console.log('dynamicText - keyArr[' + n + ']: ' + keyArr[n]);
                dynamicTextClass[keyArr[n]] = obj.options[keyArr[n]];
            }
        }
        console.log('dynamicText - dynamicTextClass: ' + JSON.stringify(dynamicTextClass, null, 4));

        window.DTO = Object.create(dynamicTextClass);
        DTO.init('#dynamicText', obj.cmdObj);
    },


    delay: function(delayObj) {
        console.log('\ndelay - CALLED');

        Tthis = this;

        this.wpObj.timer = setTimeout(function() {

            Tthis.onStepReady(delayObj.execute);

        }, delayObj.wait);
    },

    // This removes a delay, so when a new step is initiated, the previous delayed function calls will not be executed.
    delay_remove: function() {
        if (this.wpObj.hasOwnProperty('timer')) {
            clearTimeout(this.wpObj.timer);
        }
    },

    // NOTE: this microhint-function exists only inside the "scope" of writeProcessClass, and therefore does not interfere with the microhint function of the global scope!
    microhint: function(arg) {
        console.log('\nmicrohint - CALLED');
        microhint($(arg.obj), arg.text, arg.multiple, arg.color);

        // TLY wants microhints to fadeIn, 4/8-2017: 
        var lastMicrohint = $(".microhint:last");
        lastMicrohint.hide();
        lastMicrohint.fadeIn('slow');
    },

    goBack: function(arg) {
        console.log('\ngoBack - CALLED - arg: ' + arg);
        if (!this.wpObj.err_eventTriggered) {
            this.api.currentStepNo -= (0 <= this.api.currentStepNo) ? 1 : 0;
            this.main();
            this.insertUserData();
            osc.save('apiData', this.api);
        }
        this.wpObj.err_eventTriggered = false; // This ensures a reset to "false" at each click on .goBack 
    },

    goForward: function(arg) {
        console.log('\ngoForward - CALLED - arg: ' + arg);
        if (!this.wpObj.err_eventTriggered) {
            console.log('goForward - A0');
            this.api.currentStepNo += (this.api.currentStepNo < jsonData.step.length - 1) ? 1 : 0;
            this.main();
            this.insertUserData();
            osc.save('apiData', this.api);
        }
        this.wpObj.err_eventTriggered = false; // This ensures a reset to "false" at each click on .goForward 
    },

    noErrMsg: function() {

    },


    cmdStrToCmdAndArg: function(cmdStr) {
        console.log('\ncmdStrToCmdAndArg - CALLED - cmdStr: ' + cmdStr);

        cmdStr = cmdStr.replace(/ /g, '');
        var pos_start = cmdStr.indexOf('(');
        var pos_end = cmdStr.indexOf(')');
        var cmd, arg;
        if ((pos_start !== -1) && (pos_end !== -1) && (pos_start < pos_end)) {
            arg = cmdStr.substring(pos_start + 1, pos_end);
            cmd = cmdStr.substring(0, pos_start);
            console.log('cmdStrToCmdAndArg - cmd: ' + cmd + ', arg: ' + arg);
        } else {
            alert('FEJL FRA cmdStrToCmdAndArg: "' + cmdStr + '" er ikke en valid funktion');
        }

        return { cmd: cmd, arg: arg };
    },


    getIdOfDomElement: function(path) {
        console.log('\ngetIdOfDomElement - CALLED - path: ' + path);

        if ((path.indexOf('this.') === -1)) { // Prevent use of e.g. "empty(this.parent)" untill a robust solution for finding a complete path to "this.parent" is found!

            if (path.match(/^\.\w+$/) !== null) { // CSS class
                console.log('getIdOfDomElement - A0');

                return path; // Return class		 		
            }

            if (path.match(/^#\w+$/) !== null) { // CSS id
                console.log('getIdOfDomElement - A1');

                return path; // Return id 
            }

            // var jsonValue = this.getJsonValue(jsonData, path);
            // console.log('getIdOfDomElement > getJsonValue - jsonValue: ' + JSON.stringify(jsonValue));

            return null;
        }
    },

    handler_errCondition: function(cmdStr) {
        console.log('\nhandler_errCondition - CALLED - cmdStr: ' + cmdStr);

        var c = this.cmdStrToCmdAndArg(cmdStr);

        var selector = this.getIdOfDomElement(c.arg); // <---  c.arg = json path

        switch (c.cmd) {
            case 'empty':
                return (this.empty(selector)) ? true : false;
                break;
            case 'test_funk':
                // CODE HERE....
                break;
            default:
                console.log('\n==================\n\tERROR: \n\thandler_errCondition - currentStepNo: ' + this.api.currentStepNo + ', function: "' + c.cmd + '" does not exist!\n==================\n');
        }
    },


    empty: function(selector) {
        console.log('\nempty - CALLED - selector: ' + selector);

        if (selector !== null) {
            console.log('empty - A0');

            if ($(selector).length > 0) {
                console.log('empty - A1');

                if ($(selector).val().length == 0) {
                    console.log('empty - A2');

                    // this.invokeErrMsg(selector);
                    return true;
                }
            } else {
                // alert("FEJL FRA empty: "+'"'+selector+'"'+" er ikke et element i DOM'en!");
                console.log('\n==================\n\tERROR: \n\tempty - selector: "' + selector + '", does not exist!\n==================\n');
            }
        }

        return false;
    },


    invokeErrMsg: function(selector) {
        console.log('\ninvokeErrMsg - CALLED - selector: ' + selector);

        var stepObj = jsonData.step[this.api.currentStepNo];
        console.log('invokeErrMsg - stepObj: ' + JSON.stringify(stepObj));

    },

    static_setEventListener: function() {

        var Tthis = this;

        $(document).on('click touchend', ".microhint", function(event) { // touchend added d. 15/11-2017 
            console.log('microhint - api: ' + JSON.stringify(Tthis.api));
            $(this).fadeOut(Tthis.api.microhint.fadeOut, function() {
                $(this).remove();
            });
        });


        $(document).on('change', 'select.dropdown', function() {
            var tagName = $(this).prop("tagName");
            console.log(".change - tagName: " + tagName);

            var value = $(this).val();
            console.log(".change - value: " + value);

            var action = String($(this).attr('data-action'));
            var target = $(this).attr('data-target');
            var targetArr = target.split(' ');
            console.log(".change - target: " + target + ', targetArr: ' + targetArr + ', action: ' + action);

            var TtagName;
            for (var n in targetArr) {
                TtagName = String($(targetArr[n]).prop("tagName").toLowerCase().trim());
                console.log(".change - TtagName: _" + TtagName + '_ $(' + targetArr[n] + ').val(): ' + $(targetArr[n]).val());

                if (Tthis.elementInArray(['input', 'textarea'], TtagName)) {
                    console.log(".change - A0");

                    if (action == 'prepend') {
                        console.log(".change - A1");
                        $(targetArr[n]).val(value + "\r" + $(targetArr[n]).val());
                    }

                    if (action == 'append') {
                        console.log(".change - A2");
                        $(targetArr[n]).val($(targetArr[n]).val() + (($(targetArr[n]).val().length > 0) ? "\r" : '') + value);
                    }

                    if ((action === 'undefined') ||  (action == 'replace')) {
                        console.log(".change - A3");
                        $(targetArr[n]).val(value);
                    }
                }

                if (Tthis.elementInArray(['div', 'span'], TtagName)) {
                    console.log(".change - A4");

                    if (action == 'prepend') {
                        console.log(".change - A5");
                        $(targetArr[n]).prepend(value);
                    }

                    if (action == 'append') {
                        console.log(".change - A6");
                        $(targetArr[n]).append(value);
                    }

                    if ((action === 'undefined') ||  (action == 'replace')) {
                        console.log(".change - A7");
                        $(targetArr[n]).text(value);
                    }
                }
            }

            Tthis.save(null);
        });

        $(document).on('click touchend', ".CloseClass", function(event) { // touchend added d. 15/11-2017 
            console.log('.CloseClass - CALLED - callOrder');
            if (typeof(Tthis.wpObj.err_eventTriggered) === 'undefined') {
                console.log('.CloseClass - A0');
                $('.template_userMsgBox_class').remove();
            } else if (!Tthis.wpObj.err_eventTriggered) {
                console.log('.CloseClass - A1');
                $('.template_userMsgBox_class').remove();
            }
        });

        // AutoSave": Save data at some timeinterval when focusin.  
        // IMPORTANT: the class ".autoSaveOff" given to an element will switch off the "autoSave" for that element. The intended use is with the template_userMsgBox and the "save()" method. 
        // $( document ).on('focusin', "input, textarea", function(event){  
        $(document).on('focusin', this.api.selector + ' input, ' + this.api.selector + ' textarea', function(event) { // By adding the api.selector, all other inputfields will not be added.  
            console.log('focusin - CALLED');

            var jqThis = this;

            if (!$(this).hasClass('autoSaveOff')) {
                window.wpcSaveTimer = setInterval(function() {
                    Tthis.saveData(jqThis, Tthis);
                }, Tthis.api.saveInterval);
            }
        });

        // Save data on focusout:
        // IMPORTANT: the class ".autoSaveOff" given to an element will switch off the "autoSave" for that element. The intended use is with the template_userMsgBox and the "save()" method.
        // $( document ).on('focusout', "input, textarea", function(event){
        $(document).on('focusout', this.api.selector + ' input, ' + this.api.selector + ' textarea', function(event) { // By adding the api.selector, all other inputfields will not be added.  
            console.log('focusout - CALLED');

            if (!$(this).hasClass('autoSaveOff')) {
                clearInterval(wpcSaveTimer);

                Tthis.saveData(this, Tthis);
            }
        });

        $(document).on('change', "input, textarea", function(event) {
            console.log('change - CALLED');

            // if (Tthis.getData.) {

            // }
        });


        // // The purpose of the ".addWrapper" class is to copy the parent wrapper. IMPORTANT: The parent has to have the class "repeat".
        // // All id's of input- and textarea-fields will be copied with the following prefix:
        // // 		Original id: 	myId
        // //		First copy: 	myId_copy_1
        // //		Second copy: 	myId_copy_2
        // // - and so on...
        // $( document ).on('click', ".addWrapper", function(event){  // Added 23/10-2017
        // 	console.log('.addWrapper - CALLED');

        // 	var parentObj = $(this).parent();

        // 	var id;
        // 	$('input', parentObj).each(function( index, element ) {
        // 		id = $(element).attr('id');

        // 		if (typeof(id)!=='undefined') {

        // 			// Tthis.api.userData[id] = val;  // <--- Sådan tilgås gemt data!

        // 		}
        // 	});

        // });

        // // The purpose of the ".removeWrapper" class is to remove the parent wrapper if the id contains the substring "_copy_". IMPORTANT: The parent has to have the class "repeat".
        // $( document ).on('click', ".removeWrapper", function(event){  // Added 23/10-2017
        // 	console.log('.removeWrapper - CALLED');

        // });


        // IMPORTANT: ONLY ONE INPUT-FIELD PR "data-wrapperClass" IS CURRENTLY SUPPORTED! 
        // The purpose of the ".addWrapper_btn" class is to copy the build on the id given in the "data-wrapperIdPrefix" attribute in a manner similar to https://www.vucdigital.dk/ks_synopsis_handout/synopsis.html 
        // All id's of input-fields will be copied with the following prefix: 
        // 		Original id: 	myId 
        //		First copy: 	myId_copy_1 
        //		Second copy: 	myId_copy_2 
        // - and so on... 
        $(document).on('click touchend', ".addWrapper_btn", function(event) { // Added 23/10-2017   // touchend added d. 15/11-2017  
            console.log('\n.addWrapper_btn - CLICKED');

            var wrapperClass = $(this).attr("data-wrapperClass");
            var wrapperIdPrefix = $(this).attr("data-wrapperIdPrefix");

            id = $('.' + wrapperClass + ' input').last().attr('id');
            console.log('.addWrapper_btn - id: ' + id + ', wrapperClass: ' + wrapperClass + ', wrapperIdPrefix: ' + wrapperIdPrefix);

            if (typeof(id) !== 'undefined') {
                console.log('.addWrapper_btn - A0');

                if (id.indexOf(wrapperIdPrefix) !== -1) {
                    console.log('.addWrapper_btn - A1');

                    if (id.indexOf('_copy_') !== -1) {
                        console.log('.addWrapper_btn - A2');

                        var len = (wrapperIdPrefix + '_copy_').length;
                        var num = parseInt(id.substring(len)) + 1;
                        console.log('.addWrapper_btn - len: ' + len + ', num: ' + num);

                        var clone = $('.' + wrapperClass).last().clone();
                        $('input', clone).attr('id', wrapperIdPrefix + '_copy_' + num);

                        $('.' + wrapperClass).last().after(clone);

                        $('.' + wrapperClass + ' input').last().val(''); // Delete any previous entered value 

                        Tthis.addWrapperToJSON(id, wrapperIdPrefix + '_copy_' + num);

                    } else {
                        console.log('.addWrapper_btn - A3');

                        var clone = $('.' + wrapperClass).last().clone();
                        $('input', clone).attr('id', wrapperIdPrefix + '_copy_1');

                        $('.' + wrapperClass).last().after(clone);

                        $('.' + wrapperClass + ' input').last().val(''); // Delete any previous entered value 

                        Tthis.addWrapperToJSON(wrapperIdPrefix, wrapperIdPrefix + '_copy_1');
                    }
                }
            }

            // Tthis.api.userData[id] = val;  // <--- Sådan tilgås gemt data! 
        });

        // // It has been desided that all "UserMsgBoxes" has to have an event-listner on the "esc"-key  ADDED 2/11-2017 
        // $(document).keyup(function(e) {
        //        if (e.keyCode == 27) { // escape key maps to keycode `27`
        //        	console.log('.keyup - A0');
        //            $(".template_userMsgBox_class").fadeOut(200, function() {
        //            	// $("#objectStorageClass_yes").trigger('click');
        //            	$('.container-fluid').fadeIn('slow');  // Fade in all program-content.
        //                $(this).remove();
        //            });
        //        }
        //    });
    },


    addWrapperToJSON: function(lastWrapperIdPrefix, lastWrapperIdPrefix_increment) {
        console.log('\naddWrapperToJSON - CALLED');
        var stepObj = jsonData.step[this.api.currentStepNo];

        var stepObjStr = JSON.stringify(stepObj);
        console.log('addWrapperToJSON - stepObjStr: ' + stepObjStr);

        if (stepObjStr.indexOf(lastWrapperIdPrefix) !== -1) {
            var content = stepObj.template_step.content; // <----- IMPORTANT: Only "template_step" can be used at this time - not template_div, template_userMsgBox, ect... If other emplate-types is to have the ".addWrapper_btn" functionality, then this has to be added.
            for (var n in content) {
                var contentStr = JSON.stringify(content[n]);
                console.log('addWrapperToJSON - n: ' + n + ', contentStr: ' + contentStr);

                if (contentStr.indexOf(lastWrapperIdPrefix) !== -1) {
                    var newWrapper = contentStr.replace(lastWrapperIdPrefix, lastWrapperIdPrefix_increment);
                    console.log('addWrapperToJSON - n: ' + n + ', newWrapper: ' + newWrapper);
                    newWrapper = JSON.parse(newWrapper);
                    content.splice(parseInt(n) + 1, 0, newWrapper); // Insert newWrapper into the n+1 position of stepObj

                    // osc.save('apiData', Tthis.api);
                    break;
                }
            }

            this.api.jsonData = jsonData; // Add the altered jsonData for localStorage.  ADDED 2/11-2017
            console.log('addWrapperToJSON - LSX  - n: ' + n + ', this.api: ' + JSON.stringify(this.api, null, 4));

            osc.save('apiData', this.api); // Do localStorage.  ADDED 2/11-2017
        }
    },


    // Insert api.userData from a privious step into JSON data
    getData_OLD: function() {
        console.log('\ngetData - CALLED');
        var stepObj = jsonData.step[this.api.currentStepNo];

        var stepObjStr = JSON.stringify(stepObj);
        console.log('getData - stepObjStr: ' + stepObjStr);

        if (stepObjStr.indexOf('"value":"') !== -1) { // NOTE: This is a robust check for the key "value", even if "value" is given as e.g. " value " (with spaces) in the JSON data.

            var valueObj = [];
            this.findKeyValues(stepObj, 'value', valueObj);
            console.log('getData - valueObj 1: ' + JSON.stringify(valueObj));

            for (var n in valueObj) {
                if ((valueObj[n].indexOf('getData(') == 0) && (valueObj[n].indexOf(' ') === -1) && (valueObj[n].indexOf(')') == valueObj[n].length - 1)) {

                    // var id = this.cmdStrToCmdAndArg(valueObj[n]).arg.replace('#', '');  // COMMENTED OUT 03-08-2017
                    var id = this.cmdStrToCmdAndArg(valueObj[n]).arg; // ADDED 03-08-2017
                    console.log('getData - id: ' + id);

                    if (this.api.userData.hasOwnProperty(id)) {
                        console.log('getData - ' + id + ': ' + this.api.userData[id]);

                        // var pos = stepObjStr.indexOf('getData(#'+id+')'); // COMMENTED OUT 03-08-2017
                        var pos = stepObjStr.indexOf('getData(' + id + ')'); // ADDED 03-08-2017
                        var pos_start = stepObjStr.lastIndexOf('{', pos);
                        var pos_end = stepObjStr.indexOf('}', pos);

                        if ((pos !== -1) && (pos_start !== -1) && (pos_end !== -1)) {
                            var parentObjStr = stepObjStr.substring(pos_start, pos_end + 1);
                            console.log('getData - parentObjStr: ' + parentObjStr);

                            var parentObj = JSON.parse(parentObjStr);

                            if (parentObj.hasOwnProperty('id')) {
                                console.log('getData - parentObj.id: ' + parentObj.id);

                                $('#' + parentObj.id).val(this.api.userData[id]);

                                console.log('getData - this.api.userData: ' + JSON.stringify(this.api.userData));
                            }
                        }
                    }
                }
            }
        };
    },


    // Insert api.userData from a privious step into JSON data
    getData: function() {
        console.log('\ngetData - CALLED');
        var stepObj = jsonData.step[this.api.currentStepNo];

        var stepObjStr = JSON.stringify(stepObj);
        console.log('getData - stepObjStr: ' + stepObjStr);

        var pos_start = stepObjStr.indexOf('getData(');
        console.log('getData - pos_start: ' + pos_start);

        var count = 0;

        while ((pos_start !== -1) && (count < 25)) {
            console.log('getData - A0');

            console.log('getData - count: ' + count);

            var pos_end = stepObjStr.indexOf(')', pos_start);

            if (pos_end !== -1) {
                console.log('getData - A1');

                var argArr = stepObjStr.substring(pos_start + 8, pos_end).replace(/\'/g, '').split(',');
                console.log('getData - argArr: ' + JSON.stringify(argArr));

                if (argArr.length == 2) {
                    console.log('getData - A2');

                    var source = argArr[0].trim();
                    var target = argArr[1].trim();
                    console.log('getData - source: "' + source + '", target: "' + target + '"');

                    if (this.api.userData.hasOwnProperty(source)) {
                        // $(target).html(this.api.userData[source.replace('#','')]);  	// COMMENTED OUT 03-08-2017
                        $(target).html(this.api.userData[source]); // ADDED 03-08-2017
                    } else {
                        $(target).html('');
                    }

                } else {
                    console.log('getData - A3');

                    alert('FEJL FRA: "getData(' + stepObjStr.substring(pos_start + 6, pos_end) + ')", som ikke rummer det rigtige antal selectors, som skal være 2.');
                }
            }

            pos_start = stepObjStr.indexOf('getData(', pos_end); // http://localhost:8080/danA_skriveproces/skriveproces3.html
            console.log('getData - pos_start: ' + pos_start);

            ++count;
        }
    },

    // This method fetches markup (BUT INTENDED FOR TEXT PRIMERALY) from the DOM by use of a source-selector, and inserts it into the target fields by use of a target-selector.
    //
    // ARGUMENTS:
    // ==========
    // 		"html(sourceSelector, targetSelector)" or "html('sourceSelector', 'targetSelector')"
    //
    // EXAMPLE OF USE: 
    // ===============
    // 		To use this method, one writes e.g. "html(#step3_instruction, .instruction)" in the JSON-file
    html: function() {
        console.log('\nhtml - CALLED');
        var stepObj = jsonData.step[this.api.currentStepNo];

        var stepObjStr = JSON.stringify(stepObj);
        console.log('html - stepObjStr: ' + stepObjStr);

        var pos_start = stepObjStr.indexOf('html(');

        var count = 0;

        while ((pos_start !== -1) && (count < 25)) {
            console.log('html - A0');

            console.log('html - count: ' + count);

            var pos_end = stepObjStr.indexOf(')"', pos_start);

            if (pos_end !== -1) {
                console.log('html - A1');

                var argArr = stepObjStr.substring(pos_start + 6, pos_end).replace(/\'/g, '').split(',');
                console.log('html - argArr: ' + JSON.stringify(argArr));

                if (argArr.length == 2) {
                    console.log('html - A2');

                    var source = argArr[0].trim();
                    var target = argArr[1].trim();
                    console.log('html - source: "' + source + '", target: "' + target + '"');

                    // $(argArr[1].trim()).html($(argArr[0].trim()).html());

                    // if (argArr[0].trim()) 
                    // $(argArr[0].trim()).before('<h4 class="step_clipborad_header">'+argArr[0].trim()+'</h4>');


                    $(target).html($(source).html());

                    $(source).before('<h4 class="step_clipborad_header">' + source + '</h4>');


                } else {
                    console.log('html - A3');

                    alert('FEJL FRA: "html(' + stepObjStr.substring(pos_start + 6, pos_end) + ')", som ikke rummer det rigtige antal selectors, som skal være 2.');
                }
            }

            pos_start = stepObjStr.indexOf('html(', pos_end);
            console.log('html - pos_start: ' + pos_start);

            ++count;
        }
    },


    // This method is designed to close/remove the template_userMsgBox when the method is called from the JSON script. 
    close_template_userMsgBox: function(selector) {
        console.log('close - CALLED - selector: ' + selector);
        $('.template_userMsgBox_class').fadeOut(200, function() {
            $('.template_userMsgBox_class').remove();
        });
    },


    // This method saves the data to the objectStorageClass:
    saveData: function(jqThis, Tthis) {
        console.log('.saveData - CALLED');

        // var id = $(jqThis).prop('id');  // COMMENTED OUT 03-08-2017
        var id = '#' + $(jqThis).prop('id'); // ADDED 03-08-2017
        var val = $(jqThis).val();
        console.log('saveData - id: ' + id + ', val: ' + val);

        if (id.length > 0) {
            Tthis.api.userData[id] = val;
        }
        console.log('saveData - thia.api.userData: ' + JSON.stringify(Tthis.api.userData));

        ///////////////////////////////
        // 		CALL SAVE API
        ///////////////////////////////

        osc.save('apiData', Tthis.api);
    },


    // IMPORTANT: the class ".autoSaveOff" given to an element will switch off the "autoSave" for that element. The intended use is with the template_userMsgBox and the "save()" method.
    save: function(arg) {
        console.log('\nsave - CALLED - arg: ' + arg);

        var Tthis = this;

        // NOTE: ".template_userMsgBox_class" needs to be included because the overlay for template_userMsgBox lays ouside this.api.selector.
        $(this.api.selector + ' input, ' + this.api.selector + ' textarea, .template_userMsgBox_class input, .template_userMsgBox_class textarea').each(function(index, element) {
            // var id = $(element).prop('id'); // COMMENTED OUT 03-08-2017
            var id = '#' + $(element).prop('id'); // ADDED 03-08-2017
            var val = $(element).val();
            console.log('save - id: ' + id + ', val: ' + val);

            if (id.length > 0) {
                Tthis.api.userData[id] = val;
            }

            console.log('save - thia.api.userData: ' + JSON.stringify(Tthis.api.userData));

            // Tthis.saveData(this, Tthis);
        });

        ///////////////////////////////
        // 		CALL SAVE API
        ///////////////////////////////

        osc.save('apiData', Tthis.api);
    },



    isUseragentSafari: function() {

        // SEE:  
        // http://sixrevisions.com/javascript/browser-detection-javascript/
        // http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
        // https://jsfiddle.net/9atsffau/

        console.log('isUseragentSafari - navigator.userAgent: ' + navigator.userAgent);

        // return (navigator.userAgent.indexOf('Safari')!==-1)?true:false;

        // return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;   // SEE:  https://jsfiddle.net/9atsffau/  // Commented out 05-10-2016

        return ((navigator.userAgent.indexOf('Safari') !== -1) && (navigator.userAgent.indexOf('Chrome') === -1) && (navigator.userAgent.indexOf('Chromium') === -1)) ? true : false; // Added 05-10-2016, see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
    },

    returnLastStudentSession: function() {
        console.log('returnLastStudentSession - CALLED');

        $("body").css("min-height", "300px");

        var Tthis = this;

        // window.osc = Object.create(objectStorageClass); 
        // osc.init('studentSession_7'); 
        // osc.exist('apiData'); 


        var apiData = osc.load('apiData');
        console.log('returnLastStudentSession - apiData: ' + JSON.stringify(apiData));

        // COMMENTED OUT 18/1-2018, due to new HTML to word convertion by use of PHP
        // =========================================================================
        // // IMPORTANT:  
        // // In this exercise, the user has to download a word-document in the last step. This is not possible when using Safari - this is why this if-clause has been added. 
        // if (((this.isUseragentSafari()) && (typeof(safariUserHasAgreed) === 'undefined'))){ 

        // 	window.safariUserHasAgreed = false; 

        // 	// Denne øvelse virker desværre ikke optimalt på Safari-platformen. Du vil ikke kunne downloade de udfyldte felter som wordfil til sidst i øvelsen. 
        // 	UserMsgBox("body", '<h4>OBS</h4> <p>Du arbejder på en Mac og bruger browseren Safari. <br> Denne øvelse virker desværre ikke optimalt på Safari-platformen. Du vil ikke kunne downloade de udfyldte felter som wordfil til sidst i øvelsen.</p><br> <p>Brug i stedet <b>Chrome</b> (<a href="https://www.google.dk/chrome/browser/desktop/">Hent den her</a>) eller <b>Firefox</b>  (<a href="https://www.mozilla.org/da/firefox/new/">Hent den her</a>).</p><br> <p>Mvh <a href="https://www.vucdigital.dk">vucdigital.dk</a> </p>'); 

        // 	$('#UserMsgBox').addClass('UserMsgBox_safari'); 
        // 	$('.MsgBox_bgr').addClass('MsgBox_bgr_safari'); 

        // 	$( document ).on('click touchend', ".UserMsgBox_safari, .MsgBox_bgr_safari", helper_msgBoxFadeout(this));  // touchend added d. 15/11-2017 

        // 	return 0; 
        // } 

        // COMMENTED OUT 18/1-2018, due to new HTML to word convertion by use of PHP
        // =========================================================================
        // function helper_msgBoxFadeout(jqThis) { 
        // 	console.log('returnLastStudentSession - helper_msgBoxFadeout - CALLED'); 
        // 	$(".MsgBox_bgr_safari").fadeOut(200, function() { 
        //            $(jqThis).remove();
        //           // $(this).remove(); // Tilføjet d. 17/11-2017 - virker ikke!!!
        //        }); 
        //        safariUserHasAgreed = true; 
        //        Tthis.returnLastStudentSession(); 
        // } 

        if ((apiData !== null) && (typeof(apiData) !== 'undefined')) {
            console.log('returnLastStudentSession - getTimeStamp: ' + osc.getTimeStamp());
            // if (apiData !== null){ 
            var HTML = '';
            HTML += '<h4>OBS</h4> Du har lavet denne øvelse før og indtastet data allerede.';
            HTML += '<div> <span id="objectStorageClass_yes" class="objectStorageClass btn btn-info">Jeg vil fortsætte, hvor jeg slap</span> <span id="objectStorageClass_no" class="objectStorageClass btn btn-info">Jeg vil starte forfra</span> </div>';
            UserMsgBox("body", HTML);


            $('.CloseClass').remove(); // <---- removes the "X" in the UserMsgBox. 
            $('.container-fluid').hide(); // Hide all program-content. 

            // $('#UserMsgBox, .MsgBox_bgr').off('click'); 
            $('.MsgBox_bgr').addClass('template_userMsgBox_class').removeClass('MsgBox_bgr');
            $('#UserMsgBox').attr('id', 'template_userMsgBox_id');

            $(document).on('click touchend', "#objectStorageClass_yes", function(event) { // touchend added d. 15/11-2017 
                console.log("objectStorageClass.init - objectStorageClass_yes - CLICK");
                $(".template_userMsgBox_class").fadeOut(200, function() {
                    $(this).remove();
                    $('.container-fluid').fadeIn('slow'); // Fade in all program-content. 
                });

                console.log('returnLastStudentSession - LSX  - apiData: ' + JSON.stringify(apiData));

                Tthis.api = apiData; // Load the saved api-data into the program api variable... 

                if ((typeof(Tthis.api.jsonData) !== 'undefined') && (typeof(Tthis.api.jsonData) === 'object') && (Tthis.api.jsonData !== null)) { // Overwrite the old jsonData with the stored one.  ADDED 2/11-2017 
                    console.log('returnLastStudentSession - LSX - A0');
                    jsonData = Tthis.api.jsonData
                } else {
                    console.log('returnLastStudentSession - LSX  - A1');
                    jsonData = jsonData;
                }

                console.log('returnLastStudentSession - LSX - jsonData: ' + JSON.stringify(jsonData, null, 4));

                Tthis.init(Tthis.api.selector); // Generate markup for the last step the student used... 

                Tthis.insertUserData(); // Insert the saved data (if any) into the markup... 
            });

            $(document).on('click touchend', "#objectStorageClass_no", function(event) { // touchend added d. 15/11-2017 
                // osc.stopAutoSave('test1');
                console.log("objectStorageClass.init - objectStorageClass_no - CLICK");
                osc.delete(osc.localStorageObjName);
                $(".template_userMsgBox_class").fadeOut(200, function() {
                    $(this).remove();
                    $('.container-fluid').fadeIn('slow', function() { // Fade in all program-content. 

                        // Tthis.rotateCheck();

                        UserMsgBox("body", '<h4>Vi gemmer dit arbejde, men...</h4> Vær opmærksom på, at dit arbejde er tilknyttet den browser, som du bruger lige nu. Det vil sige, at du ikke kan arbejde videre på en anden computer/browser. Hvis du sletter din historik i browseren, så sletter du også alt dit arbejde.'); // ADDED 8/11-2017 
                        // $('.MsgBox_bgr').addClass('template_userMsgBox_class').removeClass('MsgBox_bgr');
                        // $('#UserMsgBox').attr('id', 'template_userMsgBox_id');
                    });
                });

                Tthis.init(Tthis.api.selector);

            });
        } else {

            // Tthis.rotateCheck();

            UserMsgBox("body", '<h4>Vi gemmer dit arbejde, men...</h4> Vær opmærksom på, at dit arbejde er tilknyttet den browser, som du bruger lige nu. Det vil sige, at du ikke kan arbejde videre på en anden computer/browser. Hvis du sletter din historik i browseren, så sletter du også alt dit arbejde.'); // ADDED 8/11-2017 
            // $('.MsgBox_bgr').addClass('template_userMsgBox_class').removeClass('MsgBox_bgr'); 
            // $('#UserMsgBox').attr('id', 'template_userMsgBox_id'); 

            Tthis.init(Tthis.api.selector);
        }




        // It has been desided that all "UserMsgBoxes" has to have an event-listner on the "esc"-key  ADDED 2/11-2017 
        $(document).keyup(function(e) {
            if (e.keyCode == 27) { // escape key maps to keycode `27`
                console.log('.keyup - A0');
                $(".template_userMsgBox_class").fadeOut(200, function() {
                    $("#objectStorageClass_yes").trigger('click'); // "yes" is default if "esc" is pressed at start of localStorage choice of realoading data...
                    $('.container-fluid').fadeIn('slow'); // Fade in all program-content.
                    $(this).remove();
                });
            }
        });
    },

    // MEFGET VIGTIGT 27/11-2017: Hvis denne funktion bliver taget i brug, så er der pt en bug i Safari på live server (ikke localhost)!
    // rotateCheck() from shared_functions is only triggered for bootstrap extra-small devices (xs) - which are much smaller than the one plus two androide phone first used in test. We simply need the user to use widescreen mode on all mobile phones regardless of screen size... Therefore this function is commented out!!!
    rotateCheck: function() {
        console.log('\nrotateCheck - CALLED x');
        if (!this.insertRotateCheckOnMobileDevices) {
            console.log('rotateCheck - A0');
            rotateCheck(); // Call rotateCheck from shared_functions
            if ($('.MsgBox_bgr').length > 0) { // If a userMsgBox is present, halt program execution...
                console.log('rotateCheck - A1');
                throw new Error("\n=====================================\nrotateCheck called - program halted!\n=====================================");
            }
        }
    },


    insertUserData: function() {
        console.log('\ninsertUserData - CALLED');
        console.log('insertUserData - this.api.userData: ' + JSON.stringify(this.api.userData));
        for (var id in this.api.userData) {
            console.log('insertUserData - id: ' + id);
            // if ($('#'+id).length > 0) {  // COMMENTED OUT 03-08-2017
            // 	$('#'+id).val(this.api.userData[id]);
            // }
            if ($(id).length > 0) { // ADDED 03-08-2017
                $(id).val(this.api.userData[id]);
            }
        }
    },

    // IMPORTANT: 
    // The "onClick_setEventListener()" can apply to other tags than buttons / btn - you kan attach the "onClick_setEventListener()" to e.g. a div or span - the 
    // only requirement is that the identity of the "clickable" is resolvable by either id or class in the DOM.
    onClick_setEventListener: function() {
        console.log('\nonClick_setEventListener - CALLED');

        var stepObj = jsonData.step[this.api.currentStepNo];

        var stepObjStr = JSON.stringify(stepObj);
        console.log('onClick_setEventListener - stepObjStr: ' + stepObjStr);

        // if ((stepObjStr.indexOf('"onClick":{"')!==-1) || (stepObjStr.indexOf('"click":{"')!==-1) ) {  // NOTE: This is a robust check for the key "onClick", even if "onClick" is given as e.g. " onClick " (with spaces) in the JSON data
        if ((stepObjStr.indexOf('"onClick":') !== -1) ||  (stepObjStr.indexOf('"click":') !== -1)) { // NOTE: This is a robust check for the key "onClick", even if "onClick" is given as e.g. " onClick " (with spaces) in the JSON data
            console.log('onClick_setEventListener - A0');

            var onClickObj = [];
            this.findKeyValues(stepObj, 'onClick', onClickObj);
            console.log('onClick_setEventListener - onClickObj 1: ' + JSON.stringify(onClickObj));

            this.findKeyValues(stepObj, 'click', onClickObj);
            console.log('onClick_setEventListener - onClickObj 2: ' + JSON.stringify(onClickObj));

            console.log('onClick_setEventListener - onClickObj: ' + JSON.stringify(onClickObj, null, 4));

            var eventObj = {};
            var selector, c;
            for (var n in onClickObj) {
                console.log('onClick_setEventListener - onClickObj[' + n + ']: ' + JSON.stringify(onClickObj[n]));

                if (typeof(onClickObj[n]) === 'string') { // EXAMPLE:  "onClick": "save(#myBtn)"
                    console.log('onClick_setEventListener - A2');

                    c = this.cmdStrToCmdAndArg(onClickObj[n]);
                    selector = c.arg;

                    if (!this.elementInArray(selectorArr, selector)) { // If not the selector exsist as a key in the eventObj, then add it as key and its value (method) in an array...
                        console.log('onClick_setEventListener - A3');
                        eventObj[selector] = [];
                        eventObj[selector].push(onClickObj[n]); //  <----- both the command/method AND the target-selector is needed, e.g. "save(.goForward)"
                    } else { // If the selector exsist as a key in the eventObj, then check if the associated array has the method as an element. If not then add it...
                        console.log('onClick_setEventListener - A4');
                        if (!this.elementInArray(eventObj[selector]), onClickObj[n]) {
                            console.log('onClick_setEventListener - A3');
                            eventObj[selector].push(onClickObj[n]);
                        }
                    }

                    // this.wpObj.onClick_setEventListener_eventObj = eventObj;

                    console.log('onClick_setEventListener - eventObj 1: ' + JSON.stringify(eventObj));

                    // $( document ).on('click', selector, {Tthis: this, selector: selector, onClick_eventSpecs_no: n}, this.onClick_eventAction);  // NOTE: ".on()" and ".off()" has to have exactly similar arguments for ".off()" to work!

                } else if (Array.isArray(onClickObj[n])) { // EXAMPLE:  "onClick": ["save(#myBtn1)", "goForward(#myBtn1)"] // <--- IMPORTANT: You can give the onClick-event exactly the same arguments as onStepReady! - This allows for methods like "delay()" and "dynamicText()" to be called...
                    console.log('onClick_setEventListener - A6');

                    // for (var k in onClickObj[n]) {  
                    // 	c = this.cmdStrToCmdAndArg(onClickObj[n][k]);  
                    // 	selector = c.arg;

                    // 	// ERROR IN THE FOLLOWING ".on()" LINE: 
                    // 	// If one target selector has two or more methods attached (e.g. "save()" and "goForward()"), then BOTH methods will be called twice because the event is set twice on target-selector AND the call to the methods in onClick_eventAction() is also done twice! Therefore move the ".on()" out of the loop!
                    // 	// $( document ).on('click', selector, {Tthis: this, selector: selector, onClick_eventSpecs_no: n}, this.onClick_eventAction);  // NOTE: ".on()" and ".off()" has to have exactly similar arguments for ".off()" to work!
                    // }


                    // var eventObj = {};
                    var c, selector, selectorArr;
                    for (var k in onClickObj[n]) { // <-----------------------  VIGTIG: DENNE FUNKTIONALITET ER IKKE FÆRDIG! - 7/7-2017
                        c = this.cmdStrToCmdAndArg(onClickObj[n][k]);
                        selector = c.arg;
                        selectorArr = Object.keys(eventObj);
                        console.log('onClick_setEventListener - selectorArr: ' + selectorArr + ', selector: ' + selector);
                        if (!this.elementInArray(selectorArr, selector)) { // If not the selector exsist as a key in the eventObj, then add it as key and its value (method) in an array...
                            console.log('onClick_setEventListener - A7');
                            eventObj[selector] = [];
                            eventObj[selector].push(onClickObj[n][k]); //  <----- both the command/method AND the target-selector is needed, e.g. "save(.goForward)"
                        } else { // If the selector exsist as a key in the eventObj, then check if the associated array has the method as an element. If not then add it...
                            console.log('onClick_setEventListener - A8');
                            console.log('onClick_setEventListener - eventObj[' + selector + ']: ' + eventObj[selector] + ', onClickObj[' + n + '][' + k + ']: ' + onClickObj[n][k]);
                            if (!this.elementInArray(eventObj[selector]), onClickObj[n][k]) {
                                eventObj[selector].push(onClickObj[n][k]);
                            }
                        }
                    }

                    // this.wpObj.onClick_setEventListener_eventObj = eventObj;

                    console.log('onClick_setEventListener - eventObj 2: ' + JSON.stringify(eventObj));


                } else if (typeof(onClickObj[n]) === 'object') { // EXAMPLE:  "onClick": {"target":"#myText_1", "template":"template_userMsgBox","template_userMsgBox": {...}}
                    console.log('onClick_setEventListener - A9');

                    selector = onClickObj[n].target; // <------------------------------  VIGTIG: DENNE FUNKTIONALITET ER IKKE FÆRDIG! - 7/7-2017
                    console.log('onClick_setEventListener - selector: ' + selector);

                    if (!this.elementInArray(selectorArr, selector)) { // If not the selector exsist as a key in the eventObj, then add it as key and its value (method) in an array...
                        console.log('onClick_setEventListener - A10');
                        eventObj[selector] = [];
                        eventObj[selector].push(onClickObj[n]); //  <----- both the command/method AND the target-selector is needed, e.g. "save(.goForward)"
                    } else { // If the selector exsist as a key in the eventObj, then check if the associated array has the method as an element. If not then add it...
                        console.log('onClick_setEventListener - A11');
                        if (!this.elementInArray(eventObj[selector]), onClickObj[n]) {
                            console.log('onClick_setEventListener - A12');
                            eventObj[selector].push(onClickObj[n]);
                        }
                    }

                    // this.wpObj.onClick_setEventListener_eventObj = eventObj; 

                    console.log('onClick_setEventListener - eventObj 3: ' + JSON.stringify(eventObj));

                    // $( document ).on('click', selector, {Tthis: this, selector: selector, onClick_eventSpecs_no: n}, this.onClick_eventAction);  // NOTE: ".on()" and ".off()" has to have exactly similar arguments for ".off()" to work!
                }
            }

            console.log('onClick_setEventListener - eventObj 4: ' + JSON.stringify(eventObj));

            // if (!this.wpObj.hasOwnProperty('onClick_eventSpecs')) { // Test to see if onClick_eventSpecs is defined - if not then create it... 
            // 	console.log('onClick_setEventListener - A1'); 
            // 	this.wpObj.onClick_eventSpecs = [];     			// IMPORTANT: "onClick_eventSpecs" is an array of the of UNIQUE  
            // } 

            this.wpObj.onClick_eventSpecs = eventObj;


            for (var n in eventObj) {
                selector = n;
                console.log('onClick_setEventListener - selector 1: ' + selector);

                console.log('onClick_setEventListener - selector 2: ' + selector);

                $(document).on('click touchend', selector, { Tthis: this, selector: eventObj[n].selector, onClick_eventSpecs_no: n }, this.onClick_eventAction); // NOTE: ".on()" and ".off()" has to have exactly similar arguments for ".off()" to work!  // touchend added d. 15/11-2017 
            }

        }
    },


    onClick_eventAction: function(event) { // <-----------------------  DENNE FUNKTION SKAL OMSKRIVES MED err_setEventListener  3/7-2017
        console.log('\nonClick_eventAction - CALLED - callOrder');

        var Tthis = event.data.Tthis; // <---- See: http://api.jquery.com/on/  for documentation on how event.data pass data to a function triggered by the ".on()" event.

        // Tthis.wpObj.err_eventTriggered = false;  // <------ VIRKER IKKE

        var selector, c, func, selectorArr;
        var eventObj = Tthis.wpObj.onClick_eventSpecs;
        var n = event.data.onClick_eventSpecs_no;

        console.log('onClick_eventAction - eventObj: ' + JSON.stringify(eventObj, null, 4));

        console.log('onClick_eventAction - eventObj[' + n + ']: ' + JSON.stringify(eventObj[n]));

        for (var k in eventObj[n]) {

            console.log('onClick_eventAction - eventObj[' + n + '][' + k + ']: ' + JSON.stringify(eventObj[n][k]));

            if (typeof(eventObj[n][k]) === 'string') { // EXAMPLE:  "onClick": "save(#myBtn)"
                console.log('onClick_eventAction - A2');

                c = Tthis.cmdStrToCmdAndArg(eventObj[n][k]);
                selector = c.arg;
                func = c.cmd;
                console.log('onClick_eventAction - func: ' + func + ', selector: ' + selector);

                try { // Try first executing a method inside the writeProcessClass...
                    eval('argObj=' + JSON.stringify(selector));
                    eval('Tthis.' + func + '(argObj)');
                } catch (err) {
                    console.log('onClick_eventAction - A2_b');

                    try { // Try secondly executing a method outside the writeProcessClass...
                        eval('argObj=' + JSON.stringify(selector));
                        eval(func + '(argObj)');
                    } catch (err) {
                        // alert('ERROR: \n\tonClick_eventAction - currentStepNo: ' + this.api.currentStepNo + ', eval('+func+'()) has an error!');
                        console.log('\n==================\n\tERROR: \n\tonClick_eventAction - currentStepNo: ' + Tthis.api.currentStepNo + ', eval(' + func + '()) has an error! \n==================\n');
                    }
                }

            } else if (Array.isArray(eventObj[n][k])) { // EXAMPLE:  "onClick": ["save(#myBtn1)", "goForward(#myBtn1)"]
                console.log('onClick_eventAction - A3');

                var cmdArr = Tthis.wpObj.onClick_setEventListener_eventObj[n][k];
                console.log('onClick_eventAction - cmdArr: ' + cmdArr);

                Tthis.onStepReady(cmdArr); // <--- IMPORTANT: You can give the onClick-event exactly the same arguments as onStepReady! - This allows for methods like "delay()" and "dynamicText()" to be called...

            } else if (typeof(eventObj[n][k]) === 'object') { // EXAMPLE:  "onClick": {"target":"#myText_1", "template":"template_userMsgBox","template_userMsgBox": {...}}
                console.log('onClick_eventAction - A4');

                var dummy_stepObj = eventObj[n][k]; // <---------- IMPORTANT: The object passed to dummy_stepObj resembles / is a copy of the a "standard" stepObj. Here it can generate e.g. the template in the userMsgBox or other template...
                var HTML = Tthis.generateStepContent(dummy_stepObj);
                console.log('onClick_eventAction - HTML: ' + HTML);

                console.log('onClick_eventAction - dummy_stepObj: ' + JSON.stringify(dummy_stepObj));
                if (dummy_stepObj.hasOwnProperty('onStepReady')) { // ADDED 03-08-2017
                    Tthis.onStepReady(dummy_stepObj.onStepReady);
                }
            }
        }
    }, //  "transfereData(#save_7_1, #A, #B)"


    onClick_removeAllEventListeners: function() {
        console.log('onClick_removeAllEventListeners - CALLED');

        if (this.wpObj.hasOwnProperty('onClick_eventSpecs')) { // Test to see if err_currentEventListeners is defined.. 
            console.log('onClick_removeAllEventListeners - onClick_eventSpecs 1: ' + JSON.stringify(this.wpObj.onClick_eventSpecs));
            var ev;
            for (var n in this.wpObj.onClick_eventSpecs) {
                ev = this.wpObj.onClick_eventSpecs[n];
                console.log('onClick_removeAllEventListeners - ev: ' + JSON.stringify(ev));

                $(document).off('click touchend', ev.selector, this.onClick_eventAction); // NOTE: ".on()" and ".off()" has to have exactly similar arguments for ".off()" to work!   // touchend added d. 15/11-2017 
            }
            this.wpObj.onClick_eventSpecs = [];
            console.log('onClick_removeAllEventListeners - onClick_eventSpecs 2: ' + JSON.stringify(this.wpObj.onClick_eventSpecs));
        }
    },


    // VERY IMPORTANT:
    // =============== 
    // It has been decided, due to memory effincy in saving data between sessions for the student, to separate teacher JSON, quiz-interface JSON and student input JSON.
    // Since student input-JSON is NOT present in the quiz-interface JSON, then "event()" commands cannot be inserted by accident - and therefore it is safe to make
    // a global search in the quiz-interface JSON for the "event()" commands.
    err_setEventListener: function() {
        console.log('\nerr_setEventListener - CALLED');

        var stepObj = jsonData.step[this.api.currentStepNo];

        var stepObjStr = JSON.stringify(stepObj);
        console.log('err_setEventListener - stepObjStr: ' + stepObjStr);

        var eventArr = stepObjStr.match(/("event\(\w+\).id=\w+"|"event\(\w+\).class=\w+")/g);
        console.log('err_setEventListener - eventArr: ' + eventArr);

        if (stepObjStr.indexOf('"errMsg":{"') !== -1) { // NOTE: This is a robust check for the key "errMsg", even if "errMsg" is given as e.g. " errMsg " (with spaces) in the JSON data
            console.log('err_setEventListener - A0');

            var errMsgObj = [];
            this.findKeyValues(stepObj, 'errMsg', errMsgObj);
            console.log('err_setEventListener - errMsgObj: ' + JSON.stringify(errMsgObj));

            if (!this.wpObj.hasOwnProperty('err_eventSpecs')) { // Test to see if err_eventSpecs is defined - if not then create it...
                this.wpObj.err_eventSpecs = []; // IMPORTANT: "err_eventSpecs" is an array of the set of UNIQUE errTrigger and errCondition in each errMsg-object. The purpose of "err_eventSpecs" is to ensure that an error-eventlitsner is ONLY set once!
            }

            var str_err_eventSpecs_test = []; // Test array for eventSpecs...

            for (var n in errMsgObj) {
                for (var m in errMsgObj[n].errTrigger) {
                    for (var k in errMsgObj[n].errCondition) {

                        var eventSpec = { errTrigger: errMsgObj[n].errTrigger[m].replace(/ /g, ''), errCondition: errMsgObj[n].errCondition[k].replace(/ /g, '') }; // The .replace() function trims away sloppy spaces in the JSON...
                        var str_eventSpec = JSON.stringify(eventSpec);

                        if (str_err_eventSpecs_test.indexOf(str_eventSpec) === -1) { // Only if the eventSpecs "str_eventSpec" does not exist in str_err_eventSpecs_test
                            str_err_eventSpecs_test.push(str_eventSpec);
                            // this.wpObj.err_eventSpecs.push(str_eventSpec);

                            eventSpec.errType = errMsgObj[n].errType; // Add the errType (e.g. "microhint" or "userMsgBox") to eventSpec
                            eventSpec[eventSpec.errType] = errMsgObj[n][eventSpec.errType]; // Add the errType object itself (e.g. "microhint" or "userMsgBox") to eventSpec
                            this.wpObj.err_eventSpecs.push(eventSpec); // Save eventSpec
                        }
                    }
                }
            }

            console.log('err_setEventListener - err_eventSpecs 1: ' + JSON.stringify(this.wpObj.err_eventSpecs));


            // MARK 15.04

            var cmdObj, e, selector, eventType;
            // for (var n in eventArr) {
            for (var n in this.wpObj.err_eventSpecs) {
                selector = '';
                e = this.wpObj.err_eventSpecs[n].errTrigger; // .replace(/"/g, ''); // Remove all '"' from the match...
                cmdObj = this.cmdStrToCmdAndArg(e);
                console.log('err_setEventListener > cmdStrToCmdAndArg - e: ' + e + ', cmdObj: ' + JSON.stringify(cmdObj) + ', cmdObj.cmd: ' + cmdObj.cmd);

                selector += (e.indexOf(').id=') !== -1) ? '#' : '';
                selector += (e.indexOf(').class=') !== -1) ? '.' : '';

                selector += e.substr(e.indexOf('=') + 1);
                console.log('err_setEventListener - selector: ' + selector);

                this.wpObj.err_eventSpecs[n].selector = selector;

                eventType = cmdObj.arg;
                console.log('err_setEventListener - eventType 1: ' + eventType);

                if (this.elementInArray(Object.keys(this.wpObj.eventLookup), eventType)) { // Make a lookup and translate e.g. "onClick" ---> "click"
                    eventType = this.wpObj.eventLookup[eventType];
                }
                console.log('err_setEventListener - eventType 2: ' + eventType);

                this.wpObj.err_eventSpecs[n].eventType = eventType;

                $(document).on(eventType, selector, { Tthis: this, selector: selector, err_eventSpecs_no: n }, this.err_eventAction); // NOTE: ".on()" and ".off()" has to have exactly similar arguments for ".off()" to work!
            }

            console.log('err_setEventListener - err_eventSpecs 2: ' + JSON.stringify(this.wpObj.err_eventSpecs));
        }

    },

    // When the event is triggered, this method performs the action
    err_eventAction: function(event) { // <-----------------------  DENNE FUNKTION SKAL OMSKRIVES MED err_setEventListener  3/7-2017
        console.log('\nerr_eventAction - CALLED - callOrder');

        var Tthis = event.data.Tthis; // <---- See: http://api.jquery.com/on/  for documentation on how event.data pass data to a function triggered by the ".on()" event.

        err_eventSpecs_no = event.data.err_eventSpecs_no;

        console.log('err_eventAction - selector: ' + event.data.selector + ', err_eventSpecs_no: ' + err_eventSpecs_no);

        console.log('err_eventAction - wpObj.err_eventSpecs[' + err_eventSpecs_no + ']: ' + JSON.stringify(Tthis.wpObj.err_eventSpecs[err_eventSpecs_no], null, 4));

        if (Tthis.handler_errCondition(Tthis.wpObj.err_eventSpecs[err_eventSpecs_no].errCondition)) {

            Tthis.wpObj.err_eventTriggered = true;

            var errType = Tthis.wpObj.err_eventSpecs[err_eventSpecs_no].errType;
            console.log('err_eventAction - errType: ' + errType);

            var cmdObj = Tthis.cmdStrToCmdAndArg(Tthis.wpObj.err_eventSpecs[err_eventSpecs_no].errCondition); // <----  EXAMPLE: Tthis.wpObj.err_eventSpecs[err_eventSpecs_no].errCondition  ==  empty(#inputField_1)
            console.log('err_eventAction - cmdObj: ' + JSON.stringify(cmdObj));

            switch (errType) {
                case 'userMsgBox':
                    console.log('err_eventAction - A4');
                    userMsgBoxObj = Tthis.wpObj.err_eventSpecs[err_eventSpecs_no].userMsgBox;
                    UserMsgBox(userMsgBoxObj.target, userMsgBoxObj.text);
                    break;
                case 'microhint':
                    console.log('err_eventAction - A5');

                    microhintObj = Tthis.wpObj.err_eventSpecs[err_eventSpecs_no].microhint;

                    // NOTE: cmdObj.arg = the selector e.g. "#inputField_1"
                    microhint($(cmdObj.arg), microhintObj.text, microhintObj.multiple, microhintObj.color);
                    break;
                default:
                    console.log('\n==================\n\tERROR: \n\terr_eventAction - currentStepNo: ' + this.api.currentStepNo + ', errType: "' + errType + '" does not exist!\n==================\n');
            }
        }
        // else {
        // 	Tthis.wpObj.err_eventTriggered = false;
        // }
    },


    err_removeAllEventListeners: function() {
        console.log('err_removeAllEventListeners - CALLED');

        if (this.wpObj.hasOwnProperty('err_eventSpecs')) { // Test to see if err_currentEventListeners is defined..
            console.log('err_removeAllEventListeners - err_eventSpecs 1: ' + JSON.stringify(this.wpObj.err_eventSpecs));
            var ev;
            for (var n in this.wpObj.err_eventSpecs) {
                ev = this.wpObj.err_eventSpecs[n];
                console.log('err_removeAllEventListeners - ev: ' + JSON.stringify(ev));

                $(document).off(ev.eventType, ev.selector, this.err_eventAction); // NOTE: ".on()" and ".off()" has to have exactly similar arguments for ".off()" to work!
            }
            this.wpObj.err_eventSpecs = [];
            console.log('err_removeAllEventListeners - err_eventSpecs 2: ' + JSON.stringify(this.wpObj.err_eventSpecs));
        }
    },


    // This method find all values to the key "keyToFind" and placec them in "keyValArr". 
    // EXAMPLE OF USE:
    // ---------------
    // If:
    // 		json = {"a": [{"a1": "val_a1", "a2": "val_a2", "a3": {"a1": "val_a1"}], "b": {"a1": "val_a1"}};
    // Then:
    // 		var keyValArr = [];
    // 		keyToFind(json, "a3", keyValArr);
    // - will return: 
    // 		keyValArr = [{"a1": "val_a1"}];
    // 
    // keyToFind(json, "a1", keyValArr)  --->   keyValArr = ["val_a1", "val_a1", "val_a1"];
    findKeyValues: function(json, keyToFind, keyValArr) {
        for (var n in json) {
            if (n == keyToFind) {
                keyValArr.push(json[n]);
            }
            if (typeof(json[n]) === 'object') { // If json[n] is either a "object" or "array" typeof() returns "object"
                this.findKeyValues(json[n], keyToFind, keyValArr);
            }
        }
    },

    // This method replaces all string values with an empty string "", and thereby leaves the JSON structure with its basic value-types.
    // The purpose of this is to avoid the chars "{", "}", "[" and "]" inside string values, so the nested 
    removeAllJsonStrValues: function(json) {
        for (var n in json) {
            if (typeof(json[n]) === 'object') { // If json[n] is either a "object" or "array" typeof() returns "object"
                this.removeAllJsonStrValues(json[n]);
            } else {
                if (typeof(json[n]) === 'string') {
                    json[n] = '';
                }
            }
        }
        return json;
    },



    onlyUnique: function(value, index, self) {
        return self.indexOf(value) === index;
    },

    removeSubStrBetweenChars: function(str, char_start, char_end) {
        var pos_start = str.indexOf(char_start);
        var pos_end = str.indexOf(char_end, pos_start + 1);
        console.log('removeSubStrBetweenChars - pos_start: ' + pos_start + ', pos_end: ' + pos_end);

        if ((pos_start !== -1) && (pos_end !== -1)) {
            console.log('removeSubStrBetweenChars - A0');

            var Tstr = str.substring(pos_start, pos_end + 1);
            console.log('removeSubStrBetweenChars - Tstr: ' + Tstr);

            str = str.replace(Tstr, '');
        }
        console.log('removeSubStrBetweenChars - str: ' + str);

        return str;
    },

    elementInArray: function(tArray, element) {
        console.log('\nelementInArray - CALLED - tArray: ' + JSON.stringify(tArray) + ', element: _' + element + '_');
        for (x in tArray) {
            if (tArray[x] == element) return true;
        }
        return false;
    },

    // The pourpose of this method is to make one (or more) pass(es) through the JSON structure, and insert all JSON-data refrenced by:
    // 
    //		json(path_to_json)
    //
    // - where path_to_json is given relative to the "root" of the JSON structure (NOTE: "key_a", "key_b" and "key_c" are at root level in the following example)
    //
    // EXAMPLE OF USE:
    // ---------------
    // 		If we have the following JSON structure:
    // 			jsonData = {
    // 							"data_a": {
    //								"key_a": "some string-content of key A", 
    //								"key_b": "some string-content of key B",
    // 								"key_c": "json(data_a.key_a)" 
    // 							},
    //							"data_b": { ... },
    //							"data_c": { ... }
    // 				       }
    // 
    // 		The result of theis will be that the content "some string-content of key A" will be inserted into the value of "key_c":
    // 			jsonData.data_a.key_c = "some string-content of key A"
    jsonPreProcessor: function(jsonData) {
        var jsonStr = JSON.stringify(jsonData);
        console.log('\njsonPreProcessor - CALLED - jsonStr: ' + jsonStr);

        var pos_start, pos_end, path_to_json, jsonFuncStr, jsonVal, TjsonData;
        var count = 0;

        pos_start = jsonStr.indexOf('json(');
        while ((pos_start !== -1) && (count < 300)) {
            console.log('jsonPreProcessor - count: ' + count + ' ===================================');

            pos_end = jsonStr.indexOf(')', pos_start + 5); // <--- NOTE: 5 = 'json('.length

            if (pos_end !== -1) {
                path_to_json = jsonStr.substring(pos_start + 5, pos_end);
                console.log('jsonPreProcessor - path_to_json: ' + path_to_json);

                if (path_to_json.match(/( |")/g) === null) { // If space-char OR '"' is NOT present, then...
                    jsonFuncStr = jsonStr.substring(pos_start, pos_end + 1);
                    console.log('jsonPreProcessor - jsonFuncStr: ' + jsonFuncStr);

                    // TjsonData = JSON.parse(jsonStr);												// COMMENTED OUT 30/6-2017
                    // console.log('jsonPreProcessor - TjsonData: ' + JSON.stringify(TjsonData));   // COMMENTED OUT 30/6-2017

                    // jsonVal = JSON.stringify(this.getJsonValue(TjsonData, path_to_json)); // Convert string due string replacement later...  // COMMENTED OUT 30/6-2017
                    // console.log('jsonPreProcessor - jsonVal: ' + jsonVal);																	// COMMENTED OUT 30/6-2017

                    jsonVal = JSON.stringify(this.getJsonValue(jsonData, path_to_json)).replace(/"/g, ''); // Convert string due string replacement later...		// ADDED 30/6-2017
                    console.log('jsonPreProcessor - jsonVal: ' + jsonVal);

                    if ((typeof(jsonVal) !== 'undefined') && (jsonVal.trim().indexOf('json(') === -1)) { // <------  IMPORTANT: caluse to avoid copying another "json()" command...
                        jsonStr = jsonStr.replace(jsonFuncStr, jsonVal);
                    }
                }

                pos_start = jsonStr.indexOf('json(', pos_end);

                if (pos_start === -1) { // to make sure to replace all "json()" commands: test from the start again...
                    pos_start = jsonStr.indexOf('json(', 0);
                }
            }
            ++count;
        }
        console.log('jsonPreProcessor - jsonStr: ' + jsonStr);

        TjsonData = JSON.parse(jsonStr);
        console.log('jsonPreProcessor - TjsonData: ' + TjsonData);

        return TjsonData
    },

    // This method fetches a value from a JSON structure (json) pointed to by a path (jsonPath). 
    // The method will test to see if the path is valid - "undefined" is returned if the path is not valid!
    // INPUT FORMAT:
    // ============
    // 		json: 		This needs to be a valid standard JSON format.
    // 		jsonPath: 	This can be in one of two forms/formats
    // 						(1) Original/real JSON path, eg. "a.a1[1][1]" ----> "2" in the JSON-structure: json = {"a":{"a1":["a", [1,2,3]]}, "b":{"b1": "bbb1", "b2", "bbb2"}}
    // 						(2) A "string" JSON path, eg. "a.a1.1.1" ----> "2" in the same JSON-structure as above.
    // 					Method (1) is probably prefered because it is testable in an actual JSON-data-structure, e.g. "json.a.a1[1][1]" ----> "2".
    getJsonValue: function(json, jsonPath) {
        console.log('\ngetJsonValue - CALLED - jsonPath: ' + jsonPath);

        jsonPath = jsonPath.replace(/(\[|\])/g, '.').replace(/\.+/g, '.').replace(/\.$/, ''); // This converts input-format (1) into input-format (2).
        console.log('getJsonValue - jsonPath: ' + jsonPath);

        var jsonPathArr = jsonPath.split('.');
        console.log('getJsonValue - jsonPathArr: ' + JSON.stringify(jsonPathArr));

        console.log('getJsonValue - START - json: ' + JSON.stringify(json));
        for (var n in jsonPathArr) {
            console.log('getJsonValue - n: ' + n + ', jsonPathArr: ' + jsonPathArr[n]);

            if (json.hasOwnProperty(jsonPathArr[n])) {
                console.log('getJsonValue - A0');

                json = json[jsonPathArr[n]];
                console.log('getJsonValue - jsonPathArr[' + n + ']: ' + jsonPathArr[n] + ', json: ' + JSON.stringify(json));
            } else {
                console.log('getJsonValue - A1 - n: ' + n + ', -- UNDEFINED --');
                json = undefined;
                break;
            }
        }

        console.log('getJsonValue - END - json: ' + JSON.stringify(json));

        return json;
    },

    // generateStepContent: function(currentStepNo) {
    generateStepContent: function(stepObj) {
        console.log('\ngenerateStepContent - CALLED');

        var HTML = '';
        var content, attr, templateObj;

        // var stepObj = jsonData.step[currentStepNo];  // COMMENTED OUT 7/7-2017 and stepObj is passed as an argument instead. This is due to reuse of generateStepContent() in onClick_eventAction().

        if (stepObj.hasOwnProperty('template')) {
            console.log('generateStepContent - A0');

            template = stepObj['template'];
            console.log('generateStepContent - template: ' + template);

            if (typeof(stepObj[template]) !== 'undefined') {
                console.log('generateStepContent - A2');

                templateObj = stepObj[template];

                if (templateObj.hasOwnProperty('content')) {
                    console.log('generateStepContent - A3');

                    for (var n in templateObj.content) {
                        contentType = String(Object.keys(templateObj.content[n]));
                        content = templateObj.content[n][contentType];
                        console.log('generateStepContent - contentType: ' + contentType + ', content: ' + JSON.stringify(content));

                        HTML += this.generateContentType(contentType, content);
                    }
                }

                if (templateObj.hasOwnProperty('attr')) {
                    console.log('generateStepContent - A4');
                    attr = templateObj.attr;
                }


                HTML = this.generateTemplate(templateObj, template, attr, HTML);
            }

        }
        console.log('generateStepContent - HTML: ' + HTML);

        return HTML;
    },

    externalFunctionCaller: function(templateObj) {
        console.log('\nexternalFunctionCaller - CALLED - templateObj: ' + JSON.stringify(templateObj));
        if (templateObj.hasOwnProperty('functionCall')) {
            console.log('externalFunctionCaller - A0');

            console.log('externalFunctionCaller - functionCall 1: ' + JSON.stringify(templateObj.functionCall));

            var functionCall = templateObj.functionCall.replace(/ /g, ''); // Remove any spaces placed between arguments to improve readablity
            console.log('externalFunctionCaller - functionCall 2: ' + JSON.stringify(functionCall));

            var argStr = functionCall.substring(functionCall.indexOf('(') + 1, functionCall.indexOf(')'));
            console.log('externalFunctionCaller - argStr: ' + argStr);

            var cmd = '';
            if (argStr.length > 0) {
                console.log('externalFunctionCaller - A1');

                var argArr = argStr.split(',');

                for (var n in argArr) {
                    cmd = '';

                    console.log('externalFunctionCaller - argArr[' + n + ']: ' + argArr[n].trim());
                    cmd += argArr[n].trim() + '=';

                    console.log('externalFunctionCaller - templateObj[argArr[' + n + ']]: ' + JSON.stringify(templateObj[argArr[n].trim()]));
                    cmd += JSON.stringify(templateObj[argArr[n].trim()]);

                    eval(cmd);

                    if (typeof(argArr[n].trim()) !== 'undefined') {
                        console.log('externalFunctionCaller - check: ' + argArr[n].trim() + ' = ' + JSON.stringify(eval(argArr[n].trim())));
                    } else {
                        console.log('externalFunctionCaller - check: ' + argArr[n].trim() + ' = UNDEFINED!');
                    }
                }


            }

            eval(functionCall);
        }
    },

    // stepObj = jsonData.step
    generateTemplate: function(templateObj, template, attr, templateContentHtml) {
        console.log('\ngenerateTemplate - CALLED');

        var HTML = '',
            template;

        switch (template) {
            case 'template_div':
                HTML += this.template_div(attr, templateContentHtml);
                break;
            case 'template_noWrap':
                HTML += this.template_noWrap(attr, templateContentHtml);
                break;
            case 'template_step':
                HTML += this.template_step(attr, templateContentHtml);
                break;
            case 'template_userMsgBox':
                // code block
                HTML += this.template_userMsgBox(attr, templateContentHtml);
                break;
            case 'template_external':
                this.externalFunctionCaller(templateObj);
                break;
            default:
                console.log('\n==================\n\tERROR: \n\tgenerateTemplate - currentStepNo: ' + this.api.currentStepNo + ', template: "' + template + '" does not exist!\n==================\n');
        }

        return HTML;

    },

    // This template does not wrap the content in a tag. The template is intended for setting "onClick" event-litseners on glyphicons etc.
    template_noWrap: function(attr, templateContentHtml) {
        console.log('\ntemplate_noWrap - CALLED - attr: ' + JSON.stringify(attr) + ', templateContentHtml: ' + templateContentHtml);

        // IMPORTANT:
        // ==========
        // The following commands cannot be used in conjunction with microhints, because texts inside microhints has to be present at microhint-"runtime" - otherwise the height of the hint will be off.  
        // Therefore all text inside the microhint has to be present at the time of the call. Make placeholder-tags for single and short variables, that does not alter the dimensions of the microhint...
        // this.insertUserData();  // Insert previously saved data...
        // this.getData();
        // this.html(); // Get very long text from HTML...

        var HTML = templateContentHtml;
        return HTML;
    },


    template_userMsgBox: function(attr, templateContentHtml) {
        console.log('\ntemplate_userMsgBox - CALLED - attr: ' + JSON.stringify(attr) + ', templateContentHtml: ' + templateContentHtml);

        attr = this.addClassIfNotExist(attr, "template_microhint");

        var HTML = '';
        HTML += '<div ' + this.generateAttrStr(attr) + '>';
        HTML += templateContentHtml;
        HTML += '</div>';
        console.log('template_userMsgBox - HTML: ' + HTML);

        UserMsgBox('body', HTML);

        $('.MsgBox_bgr').addClass('template_userMsgBox_class').removeClass('MsgBox_bgr');
        $('#UserMsgBox').attr('id', 'template_userMsgBox_id');

        this.insertUserData(); // Insert previously saved data...

        this.getData();

        this.html(); // Get very long text from HTML...

        return HTML;
    },

    template_div: function(attr, templateContentHtml) {
        console.log('\ntemplate_div - CALLED - attr: ' + JSON.stringify(attr) + ', templateContentHtml: ' + templateContentHtml);

        attr = this.addClassIfNotExist(attr, "template_div");

        var HTML = '';
        HTML += '<div ' + this.generateAttrStr(attr) + '>';
        HTML += templateContentHtml;
        HTML += '</div>';
        console.log('template_div - HTML: ' + HTML);

        return HTML;
    },

    template_step: function(attr, templateContentHtml) {
        console.log('\ntemplate_step - CALLED - attr: ' + JSON.stringify(attr) + ', templateContentHtml: ' + templateContentHtml);

        attr = this.addClassIfNotExist(attr, "template_step");

        var HTML = '';
        HTML += '<div ' + this.generateAttrStr(attr) + '>';
        HTML += templateContentHtml;
        HTML += '</div>';
        console.log('template_step - HTML: ' + HTML);

        return HTML;
    },

    // This method makes "className" a member of the class in the attrObj, or defines 
    // the class property if not defined and makes "className" a member of the class.
    // INPUT-FORMAT:
    // =============
    //		attrObj: An object containing the desired attributes of the html-element, e.g. attrObj = {"id": "myId", "class": "myClass"}
    //		className: A string containing the name og the class
    addClassIfNotExist: function(attrObj, className) {
        if (typeof(attrObj) !== 'undefined') { // If "attr" is defined...
            console.log('\naddClassIfNotExist - CALLED');

            console.log('addClassIfNotExist - A0');

            if (attrObj.hasOwnProperty('class')) { // If "attr" has the property "class"...
                console.log('addClassIfNotExist - A1');

                var attrArr = attrObj.class.split(' ');

                if (!this.elementInArray(attrArr, className)) { // If "attr" has the property "class", but "template_step" is not a member of the set of classes...
                    console.log('addClassIfNotExist - A2');
                    attrObj.class += ' ' + className; // ... add "template_step" to the set of classes
                }
            } else { // If "attr" is defined, but the "class"-property is not defined, the define it and make "template_step" a member of the class
                console.log('addClassIfNotExist - A3');
                attrObj.class = className;
            }
        } else { // If "attr" is not defined, then define it...
            console.log('addClassIfNotExist - A4');
            var attrObj = { class: className };
        }

        return attrObj;
    },

    generateAttrStr: function(attrObj) {
        console.log('\ngenerateAttrStr - CALLED - attrObj: ' + JSON.stringify(attrObj));

        var HTML = '';
        // if (typeof(attrObj)!=='undefined') {
        var keyArr = Object.keys(attrObj);
        for (var n in keyArr) {
            if (typeof(attrObj[keyArr[n]]) !== 'undefined') {
                HTML += keyArr[n] + '="' + attrObj[keyArr[n]] + '" ';
            }
        }
        // }

        HTML = HTML.trim();
        console.log('generateAttrStr - HTML: _' + HTML + '_');

        return HTML;
    },

    generateContentType: function(contentType, content) {
        console.log('\ngenerateContentType - CALLED - contentType: _' + contentType + '_ , content: _' + content + '_');

        var HTML = '';
        switch (contentType) {
            case 'btn':
                HTML += this.btn(content);
                break;
            case 'breadCrumbs':
                // code block
                break;
            case 'dropdown': // <---- This is a "sentence-starter" (in danish: "sætningsstarter").
                HTML += this.returnDropdownMarkup(content);
                break;
            case 'explanation':
                HTML += explanation(content); // This requires shared_functions.js to be available!
                HTML += '<div class="Clear"></div>';
                break;
            case 'header':
                HTML += '<h1>' + content + '</h1>';
                break;
            case 'html': // This is meant as a quick way of getting som static HTML into the template.
                HTML += this.htmlContent(content);
                break;
            case 'image':
                // code block
                break;
            case 'inputField':
                // code block
                HTML += this.inputField(content);
                break;
            case 'instruction':
                // HTML += instruction(content);  // This requires shared_functions.js to be available!
                // HTML += '<div class="Clear"></div>';
                HTML += this.instruction(content);
                break;
            case 'instruction_8col':
                HTML += instruction_8col(content); // This requires shared_functions.js to be available!
                break;
            case 'link':
                // HTML += '<a href=></a>';   
                // HTML += this.link();
                break;
            case 'microhint':
                this.microhint(content);
                HTML += ''; // <---- The microhint function does not return any markup, so in order not to terminate the HTML string, an empty string is concatenated...
                break;
            case 'progressBar':
                HTML += this.returnProgressBar(content);
                break;
                // case 'repeat':  // <--- This repeats e.g. an inputfield, with the purpose of being able add or remove inputfields dynamically with "+"/"-" btns.
                //     HTML += this.repeat_set(content);
                //     break;
            case 'sound':
                // code block
                break;
            case 'sound':
                // code block
                break;
            case 'text': // This is meant as a quick way of getting som text into the template - maybe wrapped in p-tags...
                HTML += this.text(content);
                break;
            case 'tag':
                // code block
                HTML += this.tag(content);
                break;
            case 'textArea':
                // code block
                HTML += this.textArea(content);
                break;
            case 'userMsgBox':
                this.userMsgBox(content);
                break;
            case 'video':
                HTML += this.video(content);
                break;
            case 'wrapper': // ADDED 17/10-2017
                HTML += this.wrapper(content);
                break;
            default:
                console.log('\n==================\n\tERROR: \n\tgenerateContentType - currentStepNo: ' + this.api.currentStepNo + ', contentType: "' + contentType + '" does not exist!\n==================\n');
        }
        console.log('generateContentType - HTML: ' + HTML);

        return HTML;
    },

    // ADDED 17/10-2017:
    // {wrapper: {
    // 		tagName: "div",
    // 		attr: {"class": "test1 test2"},
    // 		content: [
    // 			{"text" : "<h4>Menu 1</h4>"},
    // 			{"inputField": { 
    // 				"attr" : {"id": "inputField_1", "class": "inputField", "placeholder": "Skriv i dette inputField..."}
    // 			}
    // 		]
    // }}
    wrapper: function(Tcontent) { // ADDED 17/10-2017
        console.log('\nwrapper - CALLED');

        console.log('wrapper - Tcontent: ' + JSON.stringify(Tcontent));

        var HTML = '';
        if (typeof(Tcontent) === 'object') {
            console.log('wrapper - A0');

            if (Tcontent.hasOwnProperty('tagName')) {
                console.log('wrapper - A1');

                HTML += '<' + Tcontent.tagName + ((Tcontent.hasOwnProperty('attr')) ? ' ' + this.generateAttrStr(Tcontent.attr) : '') + '>';

                if (Tcontent.hasOwnProperty('content')) {
                    console.log('wrapper - A2');

                    var TTcontent = Tcontent.content;

                    var contentType, content;
                    for (var n in TTcontent) { // Copied from generateStepContent()
                        contentType = String(Object.keys(TTcontent[n]));
                        content = TTcontent[n][contentType];
                        console.log('generateStepContent - contentType: ' + contentType + ', content: ' + JSON.stringify(content));

                        HTML += this.generateContentType(contentType, content);
                    }
                }

                HTML += '</' + Tcontent.tagName + '>';
            }
        }
        console.log('wrapper - HTML: ' + HTML);

        return HTML;
    },

    // UserMsgBox(TargetSelector, UserMsg)
    userMsgBox: function(content) {
        console.log('\nuserMsgBox - CALLED');

        console.log('userMsgBox - content: ' + JSON.stringify(content));

        if (typeof(content) === 'object') {
            console.log('userMsgBox - A0');
            var TargetSelector = (content.hasOwnProperty('target')) ? content.target : 'body';
            var UserMsg = (content.hasOwnProperty('text')) ? content.text : '';
            console.log('userMsgBox - TargetSelector: ' + TargetSelector + ', UserMsg: ' + UserMsg);

            UserMsgBox(TargetSelector, UserMsg);
        }

    },


    tag: function(content) {
        console.log('\ntag - CALLED');

        console.log('tag - content: ' + JSON.stringify(content));

        var HTML = '';
        if (typeof(content) === 'object') {
            console.log('tag - A0');
            HTML += '<' + content.tagName + ((content.hasOwnProperty('attr')) ? ' ' + this.generateAttrStr(content.attr) : '') + '>';
            HTML += (((content.hasOwnProperty('endTag')) && (!content.endTag)) || (!content.hasOwnProperty('text'))) ? '' : content.text;
            HTML += ((content.hasOwnProperty('endTag')) && (!content.endTag)) ? '' : '</' + content.tagName + '>';
        } else {
            console.log('tag - A1');
            HTML += content;
        }
        console.log('tag - HTML: ' + HTML);

        return HTML;
    },


    instruction: function(content) {
        console.log('\ninstruction - CALLED');

        var HTML = '';
        if (typeof(content) === 'object') {
            console.log('instruction - A0');
            HTML += instruction(content.value); // This requires shared_functions.js to be available!
        } else {
            console.log('instruction - A1');
            HTML += instruction(content);
        }
        HTML += '<div class="Clear"></div>';

        return HTML;
    },

    // // COMMENTED OUT 17/10-2017
    // // This method is the first part of the repeat-functionality, and work together with the repeat_make() method. 
    // // This method sets the content-object to memory. 
    // repeat_set: function(content) {
    // 	console.log('\nrepeat_set - CALLED');

    // 	if (!this.wpObj.hasOwnProperty('repeat')) {
    // 		this.wpObj.repeat = [];
    // 	}
    // 	this.wpObj.repeat.push(content);

    // 	if (!content.hasOwnProperty('attr')){
    // 		content.attr = {};
    // 	} 
    // 	content.attr.id = 'repeatContainer_'+this.wpObj.repeat.length;
    // 	var HTML = '';
    // 	HTML += '<div '+this.generateAttrStr(content.attr)+((content.hasOwnProperty('min'))? ' data-min="'+content.min+'"' : '')+((content.hasOwnProperty('max'))? ' data-max="'+content.max+'"' : '')+ '>';
    // 	HTML += '</div>';
    // 	console.log('repeat_set - HTML: ' + HTML);


    // 	console.log('repeat_set - this.wpObj.repeat: ' + JSON.stringify(this.wpObj.repeat));

    // 	return HTML;
    // },

    // // COMMENTED OUT 17/10-2017
    // // This method is the second part of the repeat-functionality, and work together with the repeat_set() method. 
    // // This method repeat the content from the content-object in the DOM. 
    // repeat_make: function() {
    // 	console.log('\nrepeat_make - CALLED');

    //    	var a = this.api.currentStepNo+1;

    //    	var HTML = '';
    //    	for (var n in this.wpObj.repeat) {
    //    		console.log('repeat_make - n: ' + n);

    //    		var content = this.wpObj.repeat[n];

    //    		var init = (content.hasOwnProperty('init'))? init : 1;

    //    		for (var i = 0; i <= init; i++) {
    //    			console.log('repeat_make - i: ' + i);

    //     		if (content.hasOwnProperty('target')) {
    //     			console.log('repeat_make - A0');

    //     			var targetArr = content.target.split(' ');
    //     			console.log('repeat_make - targetArr: ' + targetArr);

    //     			for (var k in targetArr) {
    //     				$(targetArr[k]).clone().attr('id', 'repeat_'+a+'_'+n+'_'+k).appendTo('#repeatContainer_'+String(k+1));
    //     			}
    //     		}

    //    		};

    //    		HTML += (content.hasOwnProperty('after'))? content.after : '';

    //    	}


    // 	// var stepObj = jsonData.step[this.api.currentStepNo];

    // 	// var stepObjStr = JSON.stringify(stepObj);
    // 	// console.log('repeat_make - stepObjStr: ' + stepObjStr);

    // 	// var pos_start = stepObjStr.indexOf('html(');

    // 	// var count = 0;

    // 	// while ((pos_start!==-1) && (count < 25)) {
    // 	// 	console.log('repeat_make - A0');

    // 	// 	console.log('repeat_make - count: ' + count);

    // 	// 	var pos_end = stepObjStr.indexOf(')"', pos_start);

    // 	// 	if (pos_end!==-1) {
    // 	// 		console.log('repeat_make - A1');

    // 	// 		var argArr = stepObjStr.substring(pos_start+6, pos_end).replace(/\'/g, '').split(',');
    // 	// 		console.log('repeat_make - argArr: ' + JSON.stringify(argArr));

    // 	// 		if (argArr.length == 2) {
    // 	// 			console.log('repeat_make - A2');

    // 	// 			var source = argArr[0].trim();
    // 	// 			var target = argArr[1].trim();
    // 	// 			console.log('repeat_make - source: "' + source + '", target: "' + target + '"');

    // 	// 			// $(argArr[1].trim()).html($(argArr[0].trim()).html());

    // 	// 			// if (argArr[0].trim()) 
    // 	// 			// $(argArr[0].trim()).before('<h4 class="step_clipborad_header">'+argArr[0].trim()+'</h4>');


    // 	// 			$(target).html($(source).html());

    // 	// 			$(source).before('<h4 class="step_clipborad_header">'+source+'</h4>');


    // 	// 		} else {
    // 	// 			console.log('repeat_make - A3');

    // 	// 			alert('FEJL FRA: "html('+stepObjStr.substring(pos_start+6, pos_end)+')", som ikke rummer det rigtige antal selectors, som skal være 2.');
    // 	// 		}
    // 	// 	}

    // 	// 	pos_start = stepObjStr.indexOf('html(', pos_end); 
    // 	// 	console.log('repeat_make - pos_start: ' + pos_start);

    // 	// 	++count;
    // 	// }    	
    // },


    htmlContent: function(content) {
        var HTML = '';
        if (content.hasOwnProperty('attr')) {
            HTML += '<div ' + this.generateAttrStr(content.attr) + '>';
            HTML += (content.hasOwnProperty('value')) ? content.value : content;
            HTML += '</div>';
        } else {
            HTML += content;
        }

        return HTML;
    },


    text: function(content) {
        var HTML = '';
        if (content.hasOwnProperty('attr')) {
            HTML += '<span ' + this.generateAttrStr(content.attr) + '>';
            HTML += (content.hasOwnProperty('value')) ? content.value : content;
            HTML += '</span>';
        } else {
            HTML += content;
        }

        return HTML;
    },


    // IMPORTANT:
    // ==========
    // This removes all youtube-info - see answer by "KingBriskey.com, answered Aug 17 '15 at 8:38" here: 
    // https://stackoverflow.com/questions/18893902/how-to-remove-youtube-branding-after-embedding-video-in-web-page
    // 
    // Youtube video configuration options: - MAN KAN IKKE FJERNE DET HELT!
    // https://developers.google.com/youtube/player_parameters#modestbranding
    // https://stackoverflow.com/questions/34852848/is-there-a-way-to-hide-youtube-logo-from-youtube-player-embedded-in-ios
    video: function(content) {

        var HTML = '';
        HTML += '<div ' + this.generateAttrStr(content.attr) + '>';
        // HTML += 	'<iframe class="embed-responsive-item" src="' + content.url + '?rel=0&iv_load_policy=3&autohide=2&border=0&wmode=opaque&enablejsapi=1&modestbranding=1&controls=2&showinfo=1" allowfullscreen="1" frameborder="0"></iframe>';
        HTML += '<iframe class="embed-responsive-item" src="' + content.url + '?iv_load_policy=3&modestbranding=1&showinfo=0&autohide=1&rel=0" allowfullscreen="1" frameborder="0"></iframe>';
        HTML += '</div>';

        return HTML;
    },

    btn: function(content) {
        // content.attr.class += ((content.attr.class.length > 0)? ' ' : '') + 'btn btn-primary';
        var HTML = '<div ' + this.generateAttrStr(content.attr) + '">' + content.text + '</div>';

        console.log('btn - HTML: ' + HTML);

        return HTML;
    },

    inputField: function(content) {
        // if (content.insertPreviousText) {  // <----------  VIGTIGT: Indsæt gemt tekst her!
        // 	content.attr.val = ''
        // }
        var HTML = '<input type="text" ' + this.generateAttrStr(content.attr) + ' aria-describedby="sizing-addon2">';
        console.log('inputField - HTML: ' + HTML);

        return HTML;
    },

    textArea: function(content) {
        // if (content.insertPreviousText) {  // <----------  VIGTIGT: Indsæt gemt tekst her!
        // 	content.attr.val = ''
        // }

        var HTML = '<textarea ' + this.generateAttrStr(content.attr) + '>';

        // var HTML = '<textarea ';
        // 	for (var n in content.attr) {
        // 		if (n !== 'value') {
        // 			HTML += n+'="'+content.attr[n]+'" ';
        // 		}
        // 	}
        // HTML += '>';

        // if ((typeof(content.attr.value)!=='undefined') && (content.attr.value!='') && (this.cmdStrToCmdAndArg.cmd == 'getData')) {
        // 	if (this.api.userData) {
        // 		this.cmdStrToCmdAndArg.arg
        // 	}
        // }

        HTML += '</textarea>';

        console.log('inputField - HTML: ' + HTML);

        return HTML;
    },

    // This is a copy of the progressbar from: http://www.vucdigital.dk/ks_problemformulering/problemformulering2.html
    returnProgressBar: function(showProgressBar) {
        var HTML = '';
        if (showProgressBar) {
            var stepNo = this.api.currentStepNo;
            console.log("returnProgressBar - progress: " + progress + ", jsonData.steps.length: " + jsonData.step.length + ', stepNo: ' + stepNo);
            // var progress = Math.round(stepNo/(jsonData.steps.length-1)*100);  // This gives a stepsize of 17% over 6 steps in total where step 0 has 0% progress
            var progress = Math.round((stepNo + 1) / (jsonData.step.length) * 100); // This gives a stepsize of 17% over 6 steps in total where step 0 has 0% progress
            console.log("returnProgressBar - progress: " + progress + ", jsonData.steps.length: " + jsonData.step.length);
            HTML += '<div class="row">';
            // HTML += 	'<div class="col-xs-12 col-md-12">';
            HTML += '<div id="processBarContainer"><div id="processBar" style="width:' + progress + '%;' + ((progress == 100) ? 'border-radius: 1px;' : '') + '">&nbsp;</div></div> <div id="processVal">' + String(progress) + '%</div>';
            // HTML += 	'</div>';
            HTML += '</div>';
        }
        return HTML;
    },


    // This is a copy of the returnDropdownMarkup() from: http://www.vucdigital.dk/ks_problemformulering/problemformulering2.html
    // DATAFORMAT:
    // 
    // 		All id's and class's are optional in DropdownObj:
    //
    // 		DropdownObj = {"id":"Dropdown1", "class":"Dropdown", "selected": "0",
    // 			        		"options":[
    // 			        			{"value":"Default UNSELECTED value:", "id": "id_0", "class": "dropdown"},
    // 			            		{"value":"Value 1...", "id": "id_1", "class": "dropdown"},
    // 			            		{"value":"Value 2...", "id": "id_2", "class": "dropdown"},
    // 			            		{"value":"Value 3...", "id": "id_3", "class": "dropdown"},
    // 			            		{"value":"Value 4...", "id": "id_4", "class": "dropdown"}
    // 			        		]
    // 			    		}
    returnDropdownMarkup: function(DropdownObj) {
        console.log('returnDropdownMarkup - DropdownObj: ' + JSON.stringify(DropdownObj));
        var Selected = -1;
        var DO = DropdownObj;

        console.log("DO: " + DO);
        // var HTML = '<select'+((DO.hasOwnProperty("id"))?' id="'+DO.id+'"':"")+((DO.hasOwnProperty("class"))?' class="'+DO.class+'"':"")+'>';
        var HTML = '<select' + ((DO.hasOwnProperty("id")) ? ' id="' + DO.id + '"' : "") + ' class="dropdown' + ((DO.hasOwnProperty('class')) ? ' ' + DO.class : '') + '"' + ((DO.hasOwnProperty("target")) ? ' data-target="' + DO.target + '"' : "") + ((DO.hasOwnProperty("action")) ? ' data-action="' + DO.action + '"' : "") + '>';
        if (DO.hasOwnProperty("selected"))
            Selected = parseInt(DO.selected);
        console.log("returnDropdownMarkup - Selected: " + Selected);
        var DOO = DropdownObj.options;
        for (n in DOO) {
            HTML += '<option' + ((DOO[n].hasOwnProperty("id")) ? ' id="' + DOO[n].id + '"' : "") + ((DOO[n].hasOwnProperty("class")) ? ' class="' + DOO[n].class + '"' : "") + ((n == Selected) ? ' disabled selected' : "") + ' value="' + ((n == Selected) ? '' : DOO[n].value) + '">' + DOO[n].value + '</option>';
        };
        HTML += "</select>";
        return HTML;
    }
}


//######################################################################################

// FROM: 
// https://stackoverflow.com/questions/1946165/json-find-in-javascript
function ContainsKeyValue(obj, key, value) {
    if (obj[key] === value) return true;
    for (all in obj) {
        if (obj[all] != null && obj[all][key] === value) {
            return true;
        }
        if (typeof obj[all] == "object" && obj[all] != null) {
            var found = ContainsKeyValue(obj[all], key, value);
            if (found == true) return true;
        }
    }
    return false;
}


function traverseTree(json) {
    for (var n in json) {
        // console.log("traverseTree - "+n+" - type: " + typeof(json[n]));
        if (typeof(json[n]) === 'object') { // If json[n] is either a "object" or "array" typeof() returns "object"
            console.log("traverseTree - " + n + " - type: " + typeof(json[n]));
            traverseTree(json[n]);
        } else {
            console.log("traverseTree - " + n + " - value: " + json[n]);
        }
    }
}


function traverseTree_2(json, keyToFind, keyPath, passCount, valObj) {

    for (var n in json) {
        // console.log("traverseTree_2 - "+n+" - type: " + typeof(json[n]) + ', keyPath: _' + keyPath + '_');
        if (n == keyToFind) {
            valObj.push(json[n]);
        }
        if (typeof(json[n]) === 'object') { // If json[n] is either a "object" or "array" typeof() returns "object"
            keyPath += n + '.';
            console.log("traverseTree_2 - " + n + " - type: " + typeof(json[n]) + ', keyPath: _' + keyPath + '_, passCount: ' + passCount + ', valObj: ' + valObj);
            ++passCount;
            traverseTree_2(json[n], keyToFind, keyPath, passCount, valObj);
        } else {
            keyPath += n + '.' + json[n];
            console.log("traverseTree_2 - " + n + " - value: " + json[n] + ', keyPath: _' + keyPath + '_, passCount: ' + passCount + ', valObj: ' + valObj);
            // ++passCount;

            // keyPath = '';  // <--- HER KAN DER GØRES NOGET! Kopier hvvert 
            keyPath += ', ';

            // traverseTree_2(json[n], keyPath);  // <--- Uendelig loop!

            // return keyPath;  // <--- Dette stopper ekseveringen ved værdi, så andre værdier i "grenen" ikke kommer med!
        }
    }
}











//######################################################################################


$(document).ready(function() {

    // var wpc = Object.create(writeProcessClass);
    // // wpc.init("#interface");
    // wpc.returnLastStudentSession();


    // wpc.jsonPreProcessor({"key_a": "val_a", "key_b": "val_b"});

    // TEST MED quizData3_test1.json
    // =============================
    // wpc.getJsonValue(jsonData, 'general.header');  				// <---- OK - 26/6-2017
    // wpc.getJsonValue(jsonData, 'step[0]');						// <---- OK - 26/6-2017
    // wpc.getJsonValue(jsonData, 'step[0].stepNo');				// <---- OK - 26/6-2017
    // wpc.getJsonValue(jsonData, 'step[0].subSteps[0]');			// <---- OK - 26/6-2017
    // wpc.getJsonValue(jsonData, 'step[3][0]');					// <---- OK - 26/6-2017
    // wpc.getJsonValue(jsonData, 'step[1].template_step.content[5].inputField');  // <---- OK - 29/6-2017
    // console.log("TEST - jsonData : " + JSON.stringify(jsonData));

    // TEST MED quizData3_test.json
    // =============================
    // wpc.getJsonValue(jsonData, 'step[1].template_step.content[4].text');  // <---- OK - 26/6-2017

    // TEST MED LOKAL JSON-DATA
    // ========================
    // jsonData = {"a":{"a1":["a", [1,2,3]]}, "b":{"b1": "bbb1", "b2": "bbb2"}};
    // wpc.getJsonValue(jsonData, "a.a1[1][1]");				// RETURNS: 2  // <---- OK - 27/6-2017
    // wpc.getJsonValue(jsonData, "a.a1.1.1");					// RETURNS: 2  // <---- OK - 27/6-2017
    // console.log("\njsonTEST 0 : " + jsonData.a.a1[1][1]); 	// RETURNS: 2  // <---- OK - 27/6-2017

    // TEST MED quizData3_test1.json
    // =============================
    // wpc.jsonPreProcessor(jsonData);	// <---- OK - 26/6-2017

    // wpc.generateAttrStr({"id": "id_x", "class": "class_x", "data-test": "data-test_x",})  // <---- OK - 27/6-2017

    // wpc.template_step();																		// <---- OK - 27/6-2017
    // wpc.template_step({id: "myId"}, ' - TEST - ');											// <---- OK - 27/6-2017
    // wpc.template_step({id: "myId", class: "myClass1 myClass2"}, ' - TEST - ');				// <---- OK - 27/6-2017
    // wpc.template_step({id: "myId", class: "myClass1 myClass2 template_step"}, ' - TEST - '); // <---- OK - 27/6-2017

    // wpc.generateStepContent(1);

    // wpc.pathToThisKey_column(jsonData.step[1], 'inputField');
    var json = { "a": [{ "a1": "val_a1", "a2": "val_a2", "a3": { "a1": "val_a1" }, "a4": "val_a4" }, { "a1": "val_a1" }], "b": { "a1": "val_a1" } };

    // console.log('traverseTree + traverseTree_2 - json: ' + JSON.stringify(json, null, 4));
    // traverseTree(jsonData);


    // 0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
    //          |         |         |         |         |         |         |         |         |         |
    // ("a":(("a1":"val_a1","a2":"val_a2","a3":("a1":"val_a1"),"a4":"val_a4")),"b":("a1":"val_a1"))


    var valObj = [];
    // traverseTree_2(json, 'a1', '', 0, valObj);
    console.log('traverseTree_2 - FINAL - valObj: ' + JSON.stringify(valObj));

    // wpc.removeSubStrBetweenChars('Dette er en "[]{}" test!', '"', '"');

    var valObj = [];
    wpc.findKeyValues(json, 'a3', valObj);
    console.log('findKeyValues - FINAL - valObj: ' + JSON.stringify(valObj));

    // wpc.cmdStrToCmdAndArg('xxx(step[1].template_step.content[5].inputField)');

    // wpc.noErrMsg();

    DropdownObj = {
        "id": "Dropdown1",
        "class": "Dropdown",
        "selected": "0",
        "options": [
            { "value": "Default UNSELECTED value:", "id": "id_0", "class": "class_0" },
            { "value": "Value 1...", "id": "id_1", "class": "class_1" },
            { "value": "Value 2...", "id": "id_2", "class": "class_2" },
            { "value": "Value 3...", "id": "id_3", "class": "class_3" },
            { "value": "Value 4...", "id": "id_4", "class": "class_4" }
        ]
    }
    console.log('returnDropdownMarkup ' + wpc.returnDropdownMarkup(DropdownObj));


    // var json = {step:[{'a': 1}, {'b': 2}]};
    // console.log("\njsonTEST 1 : " + JSON.stringify(json['step']));
    // console.log("\njsonTEST 2 : " + JSON.stringify(json['step'][0]));

    // var temp1 = "";
    // var count1 = (temp1.match(/World/g) || []).length;
    // console.log("Hello World - count1: " + count1);


    //
    //
    // http://defiantjs.com/
    // https://stackoverflow.com/questions/1946165/json-find-in-javascript
    //


    // // FROM: 
    // // https://stackoverflow.com/questions/8790607/javascript-json-get-path-to-given-subnode?lq=1
    // var data = {
    //     key1: {
    //         children: {
    //             key2: 'value',
    //             key3: 'value',
    //             key4: { a: 12 }
    //         },
    //         key5: 'value'
    //     }
    // };

    // var x = data.key1.children.key4;

    // var path = "data";
    // function search(path, obj, target) {
    //     var found = false;
    //     for (var k in obj) {
    //         if (obj.hasOwnProperty(k))
    //             if (obj[k] === target)
    //                 return path + "['" + k + "']"
    //              else if (typeof obj[k] === "object") {
    //                  var result = search(path + "['" + k + "']", obj[k], target);
    //                  if (result)
    //                      return result;
    //                 }
    //     }
    //     return false;
    // }

    // var path = search(path, data, x);
    // console.log(path); //data['key1']['children']['key4']


    var a = { "a": { "b": "c" } };
    console.log('TEST obj 1: ' + Object.keys(a));

    var a = [{ "a": 1 }, { "b": 2 }]
    console.log('TEST obj 2: ' + Object.keys(a));

    var a = { 1: { "b": "c" } };
    console.log('TEST obj 1: ' + Object.keys(a));


});

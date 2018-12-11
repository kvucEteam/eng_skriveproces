// HOW TO USE dynamicTextClass
// ===========================
//
// SETUP:
// ------
// Setup of dynamicTextClass requires two HTML empty span-tags (or div-tags with display: inline) - the first needs the id "dynamicText", 
// and the next the class "cursor":
//
//      <span id="dynamicText"></span><span class="cursor">|</span>
// 
// DEMO:
// -----
// To run a default demo do the following:
//
//      var DTO = Object.create(dynamicTextClass); 
//      DTO.init('#dynamicText');
//
// This will run dynamicTextClass in demo mode, showing the textediting features insert(), add(), cut(), del() and wait().
//
// RUNNING OWN COMMANDS:
// ---------------------
// To run you own text commands do the following:
//
//      var DTO = Object.create(dynamicTextClass); 
//      DTO.init('#dynamicText', you_own_cmdObj);
//
// - where you_own_cmdObj is an array of commands seen in the cmdObj demo below.
//
var dynamicTextClass = {
    delimiter: {begin: "#", end: "#"},  // Not in use yet...
    typeSpeed: 75,     // Time in milliseconds between each keystroke.
    timeout: 0,         // Default time in milliseconds between each command.
    cursorBlink: 300,   // Cursor blink speed.
    cmdObj: [ // This is a small default demo of how to use the dynamicTextClass program.
        {"insert": "Dette er en lille tekst editeringstest. Vi venter 3 sekunder mellem handlinger - dette gøres med kommandoen wait()..."},
        {"wait": 3000},
        {"insert": " Man kan indsætte lidt tekst via kommandoen insert()."},
        {"wait": 3000},
        {"add": " Man kan imitere at der skrives tekst via add(), og man kan slette tekst via del(): bla bla bla bla..."},
        {"wait": 3000},
        {"del": "4w1c"}, // XXw = delete "XX words", YYc = delete "YY chars", XXwYYc = delete "XX words" AND "YY chars".
        {"wait": 3000},
        {"add": ". Man kan også cutte tekst væk via cut(): bla bla bla bla..."},
        {"wait": 3000},
        {"cut": "4w1c"},  // XXw = cut "XX words", YYc = cut "YY chars", XXwYYc = cut "XX words" AND "YY chars".
        {"wait": 1000},
        {"add": " - således."},
        {"wait": 3000},
        {"add": " Dette er enden på denne lille præsentation :-)"},
        {"wait": 3000},
        {"removeCursor": 300}
    ],
    interval : null,
    init : function(){ // ARGUMENTS: 1: tagetSelector, 2: cmdObj (which is optional. If cmdObj is omitted, the default cmdObj above is loaded).
        this.tagetSelector = arguments[0];
        if (typeof(arguments[1]) !== 'undefined') this.cmdObj = arguments[1];

        this.findCmd();             // <-------- IMPORTANT: UNCOMMENT TO ACTIVATE!!!  02-06-2016
        this.startCursorBlink();    // <-------- IMPORTANT: UNCOMMENT TO ACTIVATE!!!  02-06-2016
    },
    add : function(text){   // This method types the text given as argument. The typing speed is given by "typeSpeed".
        console.log('add - CALLED');
        var count = 0;
        var chars = text.split('');
        console.log('add - chars: ' + chars);
        xthis = this;
        this.timeId_add = setInterval(function(){ 
            if (count < chars.length){
                console.log('add - count: ' + count + ', chars['+count+']: ' + chars[count]);
                $(xthis.tagetSelector).append(String(chars[count])); 
                ++count;
            } else {
                console.log('add - clearInterval');
                clearInterval(xthis.timeId_add);         // Clear the "write timer" timeId
                xthis.findCmd();
            }
        }, xthis.typeSpeed);
    },
    insert: function(text){ // This method inserts the text given as argument.
        console.log('insert - CALLED');
        $(this.tagetSelector).append(text);
        this.findCmd(); 
    },
    del : function(cmd){   // This method deletes some text based on the command "cmd": XXw = delete "XX words", YYc = delete "YY chars", XXwYYc = delete "XX words" AND "YY chars". The speed by which text is deleted is given by "typeSpeed".
        console.log('del - CALLED');
        var numOfWords = (cmd.indexOf('w') !== -1)? parseInt(cmd.match(/(\d+)w/)[0].replace('w', '')) : 0;
        var numOfChars = (cmd.indexOf('c') !== -1)? parseInt(cmd.match(/(\d+)c/)[0].replace('c', '')) : 0;
        console.log('del - numOfWords: ' + typeof(numOfWords) + ', numOfChars: ' + typeof(numOfChars));
        var text = $(this.tagetSelector).text();
        var spaceArr = this.helper_spaceIndexes(text).reverse();
        var textlen = text.length;
        var numOfWordChars = (numOfWords == 0)? textlen : spaceArr[numOfWords-1];
        console.log('del - text: ' + text + ', textlen: ' + textlen + ', spaceArr: ' + spaceArr + ', numOfWordChars: ' + numOfWordChars);
        xthis = this;
        var count = 0;
        this.timeId_del = setInterval(function(){ 
            if (count < textlen-numOfWordChars+numOfChars){
                console.log('del - count: ' + count);
                text = text.slice(0,-1);
                $(xthis.tagetSelector).html(text); 
                ++count;
            } else {
                console.log('del - clearInterval');
                clearInterval(xthis.timeId_del);         // First, clear the "write timer" timeId
                xthis.findCmd();
            }
        }, xthis.typeSpeed);
    },
    cut: function(cmd){ // This method cuts away some text based on the command "cmd": XXw = delete "XX words", YYc = delete "YY chars", XXwYYc = delete "XX words" AND "YY chars".
        console.log('cut - CALLED');
        var numOfWords = (cmd.indexOf('w') !== -1)? parseInt(cmd.match(/(\d+)w/)[0].replace('w', '')) : 0;
        var numOfChars = (cmd.indexOf('c') !== -1)? parseInt(cmd.match(/(\d+)c/)[0].replace('c', '')) : 0;
        console.log('cut - numOfWords: ' + typeof(numOfWords) + ', numOfChars: ' + typeof(numOfChars));
        var text = $(this.tagetSelector).text();
        var spaceArr = this.helper_spaceIndexes(text).reverse();
        var textlen = text.length;
        var numOfWordChars = (numOfWords == 0)? textlen : spaceArr[numOfWords-1];
        console.log('cut - text: ' + text + ', textlen: ' + textlen + ', spaceArr: ' + spaceArr + ', numOfWordChars: ' + numOfWordChars);
        text = text.slice(0,-(textlen-numOfWordChars+numOfChars));
        $(this.tagetSelector).html(text);
        this.findCmd(); 
    },
    mark : function(text){  // Not in use yet...
        console.log('mark - CALLED');
    }, 
    wait : function(timeout){  // This method waits a number of milliseconds given by the argument "timeout", before the next command/method is executed.
        console.log('wait - CALLED');
        xthis = this;
        this.timeId_wait = setTimeout(function(){ 
            xthis.findCmd(); 
        }, timeout);
    }, 
    findCmd : function(milliSec){  // This method finds the next command in cmdObj and executes it. 
        console.log('findCmd - CALLED');
        xthis = this;
        this.cmdCount = (typeof(this.cmdCount) === 'undefined')? 0 : this.cmdCount + 1;
        if (this.cmdCount < this.cmdObj.length){
            console.log('findCmd - cmdCount: ' + this.cmdCount + ", Object.keys(this.cmdObj): " + Object.keys(this.cmdObj));
            var cmd = Object.keys(this.cmdObj[this.cmdCount]);
            var arg = this.cmdObj[this.cmdCount][cmd];
            arg = (typeof(arg) === "string")? '"'+arg+'"' : arg;
            console.log('findCmd - eval('+cmd+'('+arg+')'+')');
            eval('this.'+cmd+'('+arg+')');
        }
        console.log('findCmd - cmdCount 2: ' + this.cmdCount);
    },
    startCursorBlink: function() { // This method initiates cursor blink with a "blink speed" given by cursorBlink.
        console.log('startCursorBlink - CALLED');
        var xthis = this;
        this.timeId_cursor = setInterval(function(){
            $('.cursor').fadeOut(xthis.cursorBlink).fadeIn(xthis.cursorBlink);
        }, xthis.cursorBlink*2);
    }, 
    removeCursor: function(fadeTime){ // This method removes the cursor from the application - the speed by which it is removed is determined by "fadeTime".
        console.log('removeCursor - CALLED');
        clearInterval(this.timeId_cursor);
        $('.cursor').fadeOut(fadeTime);
    },
    helper_spaceIndexes: function(str){  // this method is a helper method - it returns an array containing the positions of blank space chars in a string "str" given as argument.
        spaceArr = [];
        var pos = 0; var count = -1;
        while ((str.indexOf(' ', pos) !== -1)) {
            pos = str.indexOf(' ', pos);
            if (pos !== -1) spaceArr.push(pos);
            pos += 1;
        }
        return spaceArr;
    },
    stopExec: function(timeout){ // This method stops the object instantiated from dynamicTextClass. When used, the object instantiated needs to be instantiated again.
        console.log('stopExec - CALLED');
        var xthis = this;
        setTimeout(function(){  // Remove all timers...
            xthis.removeCursor(0);
            clearInterval(xthis.timeId_del);
            clearInterval(xthis.timeId_add);
            clearInterval(xthis.timeId_cursor);
            clearTimeout(xthis.timeId_wait);
        }, timeout);
    }
}
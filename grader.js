#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var util = require('util');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertUrlFormat = function(inurl) {
	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
	if(!regexp.test(inurl)){
        console.error("%s is not a proper url. Exiting.", inurl);
        process.exit(1);
	}
	return inurl;
}

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioHtmlUrlData = function(urlData) {
    return cheerio.load(urlData);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {	
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    return fn.bind({});
};

var runFile=function(program){
    var checkJson = checkHtmlFile(program.file, program.checks, program.url);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}

var buildCallback = function(checksfile) {
    var onGetUrlComplete = function(result,response){
		if (result instanceof Error) {
			console.error(result);
			process.exit(1);
		} else {			
			$ = cheerioHtmlUrlData(result);
			var checks = loadChecks(checksfile).sort();
			var out = {};
			for(var ii in checks) {
				var present = $(checks[ii]).length > 0;
				out[checks[ii]] = present;
			}
			var outJson = JSON.stringify(out, null, 4);
			console.log(outJson);
		}		
	}
    return onGetUrlComplete;
};

var runUrl=function(program){	
	var url=program.url.toString()
	console.log("Checkeando desde url: %s",url);
	var onGetUrlComplete=buildCallback(program.checks);
	rest.get(url).on('complete',onGetUrlComplete);
}

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url <url_site>', 'Url to analyze',clone(assertUrlFormat))
        .parse(process.argv);
				
	if(undefined!=program.url){
		runUrl(program)
	}else{
		runFile(program)
	}	
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
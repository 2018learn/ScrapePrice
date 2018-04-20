// Render Multiple URLs to file
//http://phantomjs.org/examples/
//https://github.com/ariya/phantomjs/blob/master/examples/render_multi_url.js
// run from cmd line: phantomjs crawl.js

"use strict";
var RenderUrlsToFile, arrayOfUrls, system, WriteFile, fs, ListUrls, tableInfo, tableUrl, filestr, urlstr;

system = require("system");

/*
Render given urls
@param array of URLs to render
@param callbackPerUrl Function called after finishing each URL, including the last URL
@param callbackFinal Function called after finishing everything
*/

//https://docs.google.com/spreadsheets/d/1Rg_xS74fQ8vsaGqL5h3AecKpgwEru7ZLAk71e_LpUS4/edit#gid=1713929673
//https://stackoverflow.com/questions/33713084/download-link-for-google-spreadsheets-csv-export-with-multiple-sheets
//https://docs.google.com/spreadsheets/d/{key}/gviz/tq?tqx=out:csv&sheet={sheet_name}
//https://docs.google.com/spreadsheets/d/1Rg_xS74fQ8vsaGqL5h3AecKpgwEru7ZLAk71e_LpUS4/gviz/tq?tqx=out:json&sheet=url
//tqx=out:json

fs = require('fs');

WriteFile = function(content, filename) {
	//var fs = require('fs');
	try {
		fs.write(filename, content, 'w');
		//fs.write('output.txt', content, 'w');		
		return 'OK';
	} catch(e) {
		console.log(e);
		return e;
	}  	
}

ListUrls = function(urls, callbackPerUrl, callbackFinal) {
    var getFilename, next, page, retrieve, urlIndex, webpage;
    urlIndex = 0;
    webpage = require("webpage");
    page = null;
    getFilename = function() {
		//return filestr[urlIndex - 1];
        return "crawl-" + urlIndex + ".txt";
    };
    next = function(status, url, file) {
        page.close();
        callbackPerUrl(status, url, file);
        return retrieve();
    };
    retrieve = function() {		
        var url;
        if (urls.length > 0) {
            url = urls.shift();			
            urlIndex++;
            page = webpage.create();
            //page.viewportSize = {
            //    width: 800,
            //    height: 600
            //};
            //page.settings.userAgent = "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0";
            //page.settings.userAgent = "Phantom.js bot";			
            //return page.open("http://" + url, function(status) {
			console.log("ListUrls ..." + url)					
			return page.open(url, function(status) {				
                var file;
                file = getFilename();
				console.log("ListUrls ..." + status + " ... " + file);									
                if (status === "success") {
                    return window.setTimeout((function() {
                        //page.render(file);
						//WriteFile(page.content, file);
						console.log("ListUrls ..." + status);									

						tableInfo = page.evaluate(function () {
							//https://stackoverflow.com/questions/34349403/convert-table-to-array-in-javascript-without-using-jquery
							return Array.prototype.map.call(document.querySelectorAll('table tbody tr'), function(tr){
								return Array.prototype.map.call(tr.querySelectorAll('td'), function(td){
									return td.innerHTML;
								});
							});
						});
						console.log(tableInfo.length);												
						console.log(tableInfo[8][3]);
						console.log(tableInfo[8][0]);						
						var i;
						for (i = 1; i < tableInfo.length; i++) {
							//console.log('test' + i + tableInfo[i][0] + ' = ' + tableInfo[i][3]);
							//console.log("table:" + tableInfo[i][3]] + ' = ' + tableInfo[i][0]]);
							filestr.push(tableInfo[i][3]);
							urlstr.push(tableInfo[i][0]);
							console.log(filestr[i-1] + ' = ' + urlstr[i-1]);
							//console.log(concat(filestr," || ", urlstr));
						} 	
						console.log(filestr[filestr.length-1]);
                        return next(status, url, file);
                    }), 200);
                } else {
                    return next(status, url, file);
                }
            });
        } else {
            return callbackFinal();
        }
    };
    return retrieve();
};


RenderUrlsToFile = function(urls, callbackPerUrl, callbackFinal) {
    var getFilename, next, page, retrieve, urlIndex, webpage;
    urlIndex = 0;
    webpage = require("webpage");
    page = null;
    getFilename = function() {
		//return filestr[urlIndex - 1];
        return "crawl-" + urlIndex + ".txt";
    };
    next = function(status, url, file) {
        page.close();
        callbackPerUrl(status, url, file);
        return retrieve();
    };
    retrieve = function() {		
        var url;
        if (urls.length > 0) {
            url = urls.shift();			
            urlIndex++;
            page = webpage.create();
            //page.viewportSize = {
            //    width: 800,
            //    height: 600
            //};
            //page.settings.userAgent = "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0";
            //page.settings.userAgent = "Phantom.js bot";			
            //return page.open("http://" + url, function(status) {
			console.log("RenderUrlsToFile start ... index ... " + urlIndex)					
			return page.open(url, function(status) {				
                var file;
                //file = getFilename();
				file = filestr[urlIndex-1]; //getFilename();				
				console.log("RenderUrlsToFile ... file " + status + " ... " + file);									
                if (status === "success") {
                    return window.setTimeout((function() {
                        //page.render(file);
						WriteFile(page.content, file);
						//console.log("RenderUrlsToFile ..." + status);									

                        return next(status, url, file);
                    }), 200);
                } else {
                    return next(status, url, file);
                }
            });
        } else {
            return callbackFinal();
        }
    };
    return retrieve();
};

arrayOfUrls = null;
filestr = [];
urlstr = [];

if (system.args.length > 1) {
    arrayOfUrls = Array.prototype.slice.call(system.args, 1);
} else {
    console.log("Usage: phantomjs render_multi_url.js [domain.name1, domain.name2, ...]");
	//https://stackoverflow.com/questions/33713084/download-link-for-google-spreadsheets-csv-export-with-multiple-sheets
    arrayOfUrls = ["https://docs.google.com/spreadsheets/d/11wWEHbUnUmWBFj2FOaqHaY83AWJhN6uTVl6WGJLHjoE/gviz/tq?tqx=out:html"];
}

//ListUrls(arrayOfUrls, (function(status, url, file) {
ListUrls(arrayOfUrls, (function(status, url, file) {	
    if (status !== "success") {
        return console.log("Unable to render '" + url + "'");
    } else {
        return console.log("Rendered '" + url + "' at '" + file + "'");
    }
}), function() {
	console.log('CallbackFinal ListUrls = ' + filestr[filestr.length-1]);
	//phantom.exit()
	
	//RenderUrlsToFile(urlstr, (function(status, url, file) {
	RenderUrlsToFile(urlstr, (function(status, url, file) {	
		if (status !== "success") {
			return console.log("Unable to render '" + url + "'");
		} else {
			return console.log("Rendered '" + url + "' at '" + file + "'");
		}
	}), function() {
		console.log('CallbackFinal = ' + filestr[filestr.length-1]);
		return phantom.exit();
	});
	
    return;
});


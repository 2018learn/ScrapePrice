/*
CasperJs script to scrape website links
- gets list of url from a google sheet of URLs
	- puts it into a url array
- for each url in array, open the web page and perform some actions on the page
	- click show more button in page to retrieve all items
	- make a screen capture and save the page content


Useful links:
https://www.joecolantonio.com/2014/10/14/how-to-install-phantomjs/
http://testing-for-beginners.rubymonstas.org/headless/phantomjs.html
http://phantomjs.org/page-automation.html
https://github.com/ariya/phantomjs/blob/master/examples/render_multi_url.js
https://www.import.io/

https://stackoverflow.com/questions/22039826/what-is-the-correct-way-to-launch-slimerjs-in-casperjs-with-an-absolute-path
https://www.w3schools.com/jsref/dom_obj_all.asp
https://www.w3schools.com/cssref/css_selectors.asp

https://nicolas.perriault.net/code/2012/introducing-casperjs-toolkit-phantomjs/
http://code-epicenter.com/why-is-casperjs-better-than-phantomjs/
http://code-epicenter.com/how-to-login-to-amazon-using-casperjs-working-example/
code-epicenter.com/how-to-login-to-facebook-using-casperjs/
https://dzone.com/articles/building-your-own-web-scraper-in-nodejs

https://stackoverflow.com/questions/42069021/how-to-set-viewport-height-auto-in-casperjs

https://github.com/thayton/casperjs-taleo-job-scraper/blob/master/scraper.js

*/

var casper = require('casper').create({
    //verbose: true, 
    //logLevel: 'debug',	
    pageSettings: {
        loadImages: false,//The script is much faster when this field is set to false
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
		//https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent
    }
});

var timeStart = new Date().getTime();
var fs = require('fs');
function saveImage(fname) {
	casper.viewport(800, 800);	
	console.log("Capture Screenshot ...");
	//var fnameImg = new Date().getTime() + '.png';
	var saveImg = fs.pathJoin(fs.workingDirectory, 'epic', fname + '.png');	
	casper.capture(saveImg);	   	
}
 
//var url = 'http://www.parknshop.com/en/baby-care/baby-milk-powder/c/080202';

/*var links = [
    'http://www.parknshop.com/en/baby-care/baby-milk-powder/c/080202',
    'http://www.parknshop.com/en/-snacks-confectionery/biscuits/biscuit-sticks-pretzels/c/030101',
    'http://www.parknshop.com/en/groceries/beans-grains/c/020201'
];
*/
var links = [];

//Looping function to click through more pages until no futher pages
//https://stackoverflow.com/questions/27359705/how-to-break-casperjs-repeat-function-when-a-condition-is-fulfilled
function loopBody(index, numTimes){
	var conditionFailed = false;
	var itemCount = parseInt(this.fetchText("div.countItems"));
	var selector = "span#itemLeftForProductList";			
	conditionFailed = isNaN(parseInt(this.fetchText(selector)));
	//this.echo("condition ... " + conditionFailed);
    if (conditionFailed || index >= numTimes) {
		this.echo("Iterated times : " + index + ", " + conditionFailed + ", Items : " + parseInt(this.fetchText(selector)) + " / " + itemCount);
        return;
    };
    this.then(function(){
        // do something useful
		//this.echo("Loop number" + index + ", Items remaining: " + parseInt(this.fetchText(selector)));
		//if (!(conditionFailed || index >= numTimes)) {
			this.click("div.btn-show-more");		
			//this.wait(1000, function(){this.echo("wait 1 sec ... num: " + index)});
			//this.waitForSelectorTextChange(selector, function() { this.echo('The text on .selector has been changed, num : ' + index); });			
			
			//https://stackoverflow.com/questions/18204305/how-to-increase-the-timeout-in-casperjs
			//http://docs.casperjs.org/en/latest/modules/casper.html#waitforselectortextchange
			this.waitForSelectorTextChange(selector, function() {
				//this.echo('The text on .selector has been changed, num : ' + index);
			}, function timeout() { 
				this.echo('Timeout ..., num : ' + index);
			}, 10000);
			
		//};
    });
    this.then(function(){
		//if (!(conditionFailed || index >= numTimes)) {
			loopBody.call(this, index+1, numTimes); //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call
		//};
    });
};

var linkOfUrls = "https://docs.google.com/spreadsheets/d/11wWEHbUnUmWBFj2FOaqHaY83AWJhN6uTVl6WGJLHjoE/gviz/tq?tqx=out:html";


//**********************
// Interating through every url link
casper.start()

casper.thenOpen(linkOfUrls)

//********************** get list of url array - links
casper.then(function(){
	this.echo(this.getTitle());	
	links = this.evaluate(function () {
			console.log('next evaluate inside....');	
		//https://stackoverflow.com/questions/34349403/convert-table-to-array-in-javascript-without-using-jquery
		return Array.prototype.map.call(document.querySelectorAll('table tbody tr'), function(tr){
			return Array.prototype.map.call(tr.querySelectorAll('td'), function(td){
				console.log('inner....');	
				return td.innerHTML;
			});
		});
	});
});

var i, filestr, urlstr;
casper.then(function() {
	filestr = [];
	urlstr = [];
	this.echo(links);
	for (i = 1; i < links.length; i++) {
		filestr.push(links[i][3]);
		urlstr.push(links[i][0]);
		console.log(filestr[i-1] + ' = ' + urlstr[i-1]);
	} 	
	console.log("final file in list : " + filestr[filestr.length-1]);
	
    //this.bypass(1);  //skip next navigation steps
})

casper.then(function(){
	//http://www.camroncade.com/casperjs-tips-and-tricks/
	//http://docs.casperjs.org/en/latest/modules/casper.html#eachthen
	i=1;
	this.each(urlstr, function(self, link) {
		self.thenOpen(link, function() {
			this.echo(this.getTitle());
			
			//********************** For each link, loop and click for more pages, save file and image
			this.then(function(){
				var numTimes = 30;
				loopBody.call(this, 0, numTimes);	
			});
			 
			//Save file and screenshot
			this.then(function(){
				var currentTime = new Date();
				var month = currentTime.getMonth() + 1;
				var day = currentTime.getDate();
				var year = currentTime.getFullYear();
				//var myfile = "data\\data-"+year + "-" + month + "-" + day+".html";				
				var fname = filestr[i-1] + "_" + year + ("0" + month).slice(-2) + ("0" + day).slice(-2);
				//this.echo(fname);			

				var save = fs.pathJoin(fs.workingDirectory, 'epic', fname + '.txt');	
				fs.write(save, this.getPageContent(), 'w');		
				//saveImage(fname);		
				//console.log("Make a screenshot and save it");
				var time = new Date().getTime() - timeStart;
				this.echo(fname + ", Duration : " + time);
				i=i+1;
				
				//close the page to avoid memory exhausted issue
				//https://github.com/ariya/phantomjs/issues/14143
				//https://stackoverflow.com/questions/18139421/how-to-use-casper-page-close-to-avoid-memory-leak-for-multiple-page-open
				//http://256cats.com/phantomjs-memory-leak/				
				this.page.close();
				this.page = require('webpage').create();
				//this.clearCache(); // cleared the memory cache and replaced page object with newPage().
				
			});
			
			////////////////////////////////
					
		});
	});	
});

casper.run(function() {
	var time = new Date().getTime() - timeStart;
    this.echo('So the whole suite ended. Run time / Duration : ' + time);
    this.exit(); // <--- don't forget me!
});
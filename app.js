/*required dependencies*/
const puppeteer = require('puppeteer');

//load the whole page with pageScroll
async function pageScroll(page){
	await page.evaluate( async() => {
		await new Promise( (resolve, reject) => {
			let scrollSize = 1000;

			try {
				let scrollDiv = (document.getElementsByClassName('css-lsu8bg'))[0];
				let scrollHeight = scrollDiv.scrollHeight;

				let timer = setInterval( () => {
					window.scrollBy(0,scrollSize);
					scrollSize = scrollSize + 1000;
				
					if(scrollSize >= scrollHeight) {
						clearInterval(timer);
						resolve();
					}
				}, 250);
			}
			catch(err) {
				console.log("eerror");
				resolve();
			}
		});
	});
}

let scrapSephoraItems = async() => {
	 //Load sales page
	const browser = await puppeteer.launch({
		//headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
	});
	const webPage = await browser.newPage();

	/* Nodes for sephora webpages by Index: Makeup, SkinCare, Fragrence, Hair, bath & body, tools etc*/
	let pageNodes = ["1050000","1050055","1050072","1050092","1050077","1050102","1050128","14267719"];
	let pageType = ["Makeup","SkinCare","fragrence","hair","bathAndBody","toolsAndBrushes","men","miniSize"];
	let pageUrl = "https://www.sephora.com/sale?sortBy=PRICE_LOW_TO_HIGH&node=";
	var items = [];
	let cntr = 0;	
	for(let i = 0 ; i < pageNodes.length; i++) {

		let page = pageUrl + pageNodes[i] + '&pageSize=300';
		var productType = pageType[i];
		//await webPage.goto('http://www.sephora.com/sale?sortBy=PRICE_LOW_TO_HIGH&pageSize=300');
		await webPage.goto(page);
		await pageScroll(webPage);
		items = items.concat (  await webPage.evaluate( (_pageType) => {
			let itemArr = [];

			//scrape item divs: items that contain the class css-12egk0t
			const itemsOnPage =  document.getElementsByClassName('css-12egk0t');


			for (var item of itemsOnPage) {
				var divVal = (item.getElementsByClassName('css-79elbk'))[0];
				var prices = (item.getElementsByClassName('css-68u28a'))[0];


				try {
					//retreive collection and product name from span
					var productAttributes = divVal.getElementsByTagName("span");
					var collectionName = productAttributes[0].innerText;
					var productName    = productAttributes[1].innerText;

					//retreive image source
					var imageAttr = divVal.querySelector("img").getAttribute('src');
					var imageSrc = "https://sephora.com/" + imageAttr;

					//retreive prices
					var pricesLst = prices.getElementsByTagName("span");
					var oldPrice = pricesLst[0].innerText;
					try {
						var newPrice =  pricesLst[1].innerText;
					}
					catch(err) {
						var newPrice = "";
					}
					itemArr.push({collectionName, productName, imageSrc, oldPrice, newPrice,_pageType});
				}
				catch(err){
					console.log("no")
				}
			}
			return itemArr;
		}, productType));	
	}
	browser.close()
	return items;
}

const itemLen = 0;
scrapSephoraItems().then((items) => {
	console.log(items);
	console.log(items.length);
});

module.exports = { scrapSephoraItems };


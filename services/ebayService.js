const axios = require("axios");

async function fetchMarketValue(cardName) {
  try {
    const response = await axios.get(
      "https://svcs.ebay.com/services/search/FindingService/v1",
      {
        params: {
          "OPERATION-NAME": "findItemsByKeywords",
          "SERVICE-VERSION": "1.0.0",
          "SECURITY-APPNAME": process.env.EBAY_APP_ID,
          "RESPONSE-DATA-FORMAT": "JSON",
          "keywords": cardName,
          "paginationInput.entriesPerPage": 10,
          "siteid": 0
         },
      }
    );

    const searchResponse = response.data.findItemsByKeywordsResponse &&
                           response.data.findItemsByKeywordsResponse[0];
    if (!searchResponse) {
      console.error("Invalid eBay response structure");
      return null;
    }

    const searchResult = searchResponse.searchResult && searchResponse.searchResult[0];
    const items = (searchResult && searchResult.item) || [];
    if (items.length === 0) return null;

    let totalPrice = 0;
    let validItems = 0;
    items.forEach((item) => {
      const priceObj = item.sellingStatus[0].currentPrice[0];
      const price = parseFloat(priceObj.__value__);
      if (!isNaN(price)) {
        totalPrice += price;
        validItems++;
      }
    });

    if (validItems === 0) return null;
    return totalPrice / validItems;
  } catch (error) {
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    } else {
      console.error("Error fetching market value from eBay:", error.message);
    }
    return null;
  }
}

module.exports = fetchMarketValue;
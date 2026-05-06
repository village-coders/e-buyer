(function (psTemplates, undefined) {
    "use strict";

    if (!psTemplates.addTemplate || typeof psTemplates.addTemplate !== "function") return;

    /* default template with quick buy: */
    psTemplates.addTemplate(
        "defaultWithQuickBuy" /* <=== Give the template a *unique* name here */,
        '<div class="%%PSTEMPLATEMAINCLASS%%">' +
            '   <div class="innerPSTemplate">' +
            '   <p class="PSPlacementTitle">{{title}}</p>' +
            '<div class="ps-swiper-container">' +
            '<ul class="row swiper-wrapper ProductSuggestionsListing">' +
            "   {{#products}}" +
            "   <li>" +
            '   	<div class="SuggestedProduct" data-placementpos="{{../placementPosition}}" data-productpos="{{productPosition}}" data-productid="{{productId}}" data-productname="{{title}}">' +
            '   		<div class="productimage s-productthumbimage">' +
            '   			<a href="{{url}}" class="PSImage">' +
            '   				<img class="PSPimg-res" src="{{imageUrl}}" alt="{{imageAltText}}">' +
            "   			</a>" +
            "   		</div>" +
            "           {{#if %%QuickBuyEnabled%%}}" +
            '               <div class="hotspotbuy hotspotquickbuy" data-colourvariantid="{{productId}}" data-hsshowallcolours="false" data-iswishlist="false" data-hsisproductrecclick="true" style="display: none;">' +
            '                   <span class="QuickLookIcon"></span>' +
            '                   <span class="QuickLookText">%%QuickBuyText%%</span>' +
            "               </div>" +
            "           {{/if}}" +
            "           {{#if %%WishListEnabled%%}}" +
            '               <div class="hotspotbuy hotspotwishlist" data-colourvariantid="{productId}}" data-hsshowallcolours="false" data-iswishlist="true" data-hsisproductrecclick="true" data-userloggedin="%%UserLoggedIn%%" style="display: none;">' +
            '                   <span class="WishIcon"></span>' +
            '                   <span class="WishText">%%WishListText%%</span>' +
            "               </div>" +
            "           {{/if}}" +
            "           <h4>" +
            '   		    <a href="{{url}}">' +
            '                   <span class="PSProdBrand"><span class="wrap">{{brand}}</span></span>' +
            '   		    	<span class="PSProdTitle"><span class="wrap">{{name}}</span></span>' +
            "   		    </a>" +
            "           </h4>" +
            '   		<div class="PSProdPrice">' +
            '   		    <div class="PSFromSell">' +
            '   			    {{#fromPrice}}<span class="PSFrom">%%FROM%%</span>{{/fromPrice}} <span class="PSSellPrice">{{sellPrice}}</span>' +
            "   		    </div>" +
            '               {{#if additionalPriceLabel}}<span class="AdditionalPriceLabel">{{additionalPriceLabel}}</span>{{/if}}' +
            "   			{{#hasRefPrice}}" +
            '   			<div class="PSTicketSell">' +
            '   				{{#showTicketPricePrefix}}<span class="ticketPricePrefix">%%TPP%% </span>{{/showTicketPricePrefix}}' +
            '                   <span class="PSRefPrice">{{refPrice}}</span>' +
            "   			</div>" +
            "   			{{/hasRefPrice}}" +
            "   		</div>" +
            "   	</div>" +
            "   </li>" +
            "   {{/products}}" +
            "</ul>" +
            '<div class="swiper-button-next ps-swiper-button-next"></div>' +
            '<div class="swiper-button-prev ps-swiper-button-prev"></div>' +
            "</div>" +
            '<div class="BlockDiv"></div></div></div> ',
    );
    /* END default template */

    /* no ref price template: */
    psTemplates.addTemplate(
        "no ref price",
        '<div class="%%PSTEMPLATEMAINCLASS%%">' +
            '   <div class="innerPSTemplate">' +
            '   <p class="PSPlacementTitle">{{title}}</p>' +
            '<div class="ps-swiper-container">' +
            '<ul class="row swiper-wrapper ProductSuggestionsListing">' +
            "   {{#products}}" +
            "   <li>" +
            '   	<div class="SuggestedProduct" data-placementpos="{{../placementPosition}}" data-productpos="{{productPosition}}" data-productid="{{productId}}" data-productname="{{title}}">' +
            "   		<div>" +
            '   			<a href="{{url}}" class="PSImage">' +
            '   				<img src="{{imageUrl}}" alt="{{imageAltText}}">' +
            "   			</a>" +
            "   		</div>" +
            "            {{#if %%QuickBuyEnabled%%}}" +
            '               <div class="hotspotbuy hotspotquickbuy" data-colourvariantid="{{productId}}" data-hsshowallcolours="false" data-iswishlist="false" data-hsisproductrecclick="true" style="display: none;">' +
            '                   <span class="QuickLookIcon"></span>' +
            '                   <span class="QuickLookText">%%QuickBuyText%%</span>' +
            "               </div>" +
            "           {{/if}}" +
            "           {{#if %%WishListEnabled%%}}" +
            '               <div class="hotspotbuy hotspotwishlist" data-colourvariantid="{{productId}}" data-hsshowallcolours="false" data-iswishlist="true" data-hsisproductrecclick="true" data-userloggedin="%%UserLoggedIn%%" style="display: none;">' +
            '                   <span class="WishIcon"></span>' +
            '                   <span class="WishText">%%WishListText%%</span>' +
            "               </div>" +
            "           {{/if}}" +
            "   		<h4>" +
            '   		    <a href="{{url}}">' +
            '                   <span class="PSProdBrand"><span class="wrap">{{brand}}</span></span>' +
            '   		    	<span class="PSProdTitle"><span class="wrap">{{name}}</span></span>' +
            "   		    </a>" +
            "           </h4>" +
            '   		<div class="PSProdPrice">' +
            '   			{{#fromPrice}}<span class="PSFrom">%%FROM%%</span>{{/fromPrice}} <span class="PSSellPrice">{{sellPrice}}</span>' +
            '               {{#if additionalPriceLabel}}<span class="AdditionalPriceLabel">{{additionalPriceLabel}}</span>{{/if}}' +
            "   		</div>" +
            "   	</div>" +
            "   </li>" +
            "   {{/products}}" +
            "</ul>" +
            '<div class="swiper-button-next ps-swiper-button-next"></div>' +
            '<div class="swiper-button-prev ps-swiper-button-prev"></div>' +
            "</div>" +
            '<div class="BlockDiv"></div></div></div> ',
    );
    /* END no ref price template */

    /* no prices template: */
    psTemplates.addTemplate(
        "no prices",
        '<div class="%%PSTEMPLATEMAINCLASS%%">' +
            '   <div class="innerPSTemplate">' +
            '   <p class="PSPlacementTitle">{{title}}</p>' +
            '<div class="ps-swiper-container">' +
            '<ul class="row swiper-wrapper ProductSuggestionsListing">' +
            "   {{#products}}" +
            "   <li>" +
            '   	<div class="SuggestedProduct" data-placementpos="{{../placementPosition}}" data-productpos="{{productPosition}}" data-productid="{{productId}}" data-productname="{{title}}">' +
            "   		<div>" +
            '   			<a href="{{url}}" class="PSImage">' +
            '   				<img src="{{imageUrl}}" alt="{{imageAltText}}">' +
            "   			</a>" +
            "   		</div>" +
            "           {{#if %%QuickBuyEnabled%%}}" +
            '               <div class="hotspotbuy hotspotquickbuy" data-colourvariantid="{{productId}}" data-hsshowallcolours="false" data-iswishlist="false" data-hsisproductrecclick="true" style="display: none;">' +
            '                   <span class="QuickLookIcon"></span>' +
            '                   <span class="QuickLookText">%%QuickBuyText%%</span>' +
            "               </div>" +
            "           {{/if}}" +
            "           {{#if %%WishListEnabled%%}}" +
            '               <div class="hotspotbuy hotspotwishlist" data-colourvariantid="{{productId}}" data-hsshowallcolours="false" data-iswishlist="true" data-hsisproductrecclick="true" data-userloggedin="%%UserLoggedIn%%" style="display: none;">' +
            '                   <span class="WishIcon"></span>' +
            '                   <span class="WishText">%%WishListText%%</span>' +
            "               </div>" +
            "           {{/if}}" +
            "   		<h4>" +
            '   		    <a href="{{url}}">' +
            '                   <span class="PSProdBrand"><span class="wrap">{{brand}}</span></span>' +
            '   		    	<span class="PSProdTitle"><span class="wrap">{{name}}</span></span>' +
            "   		    </a>" +
            "           </h4>" +
            "   	</div>" +
            "   </li>" +
            "   {{/products}}" +
            "</ul>" +
            '<div class="swiper-button-next ps-swiper-button-next"></div>' +
            '<div class="swiper-button-prev ps-swiper-button-prev"></div>' +
            "</div>" +
            '<div class="BlockDiv"></div></div></div> ',
    );
    /* END no prices template */

    /* default template: */
    psTemplates.addTemplate(
        "default" /* <=== Give the template a *unique* name here */,
        '<div class="%%PSTEMPLATEMAINCLASS%%">' +
            '   <div class="innerPSTemplate">' +
            '   <p class="PSPlacementTitle">{{title}}</p>' +
            '<div class="ps-swiper-container"> ' +
            '<ul class="row swiper-wrapper ProductSuggestionsListing">' +
            "   {{#products}}" +
            "   <li>" +
            '   	<div class="SuggestedProduct" data-placementpos="{{../placementPosition}}" data-productpos="{{productPosition}}" data-productid="{{productId}}" data-productname="{{title}}">' +
            '   		<div class="productimage s-productthumbimage">' +
            '   			<a href="{{url}}" class="PSImage">' +
            '   				<img class="PSPimg-res" src="{{imageUrl}}" alt="{{imageAltText}}">' +
            "   			</a>" +
            "   		</div>" +
            "           {{#if %%QuickBuyEnabled%%}}" +
            '               <div class="hotspotbuy hotspotquickbuy" data-colourvariantid="{{productId}}" data-hsshowallcolours="false" data-iswishlist="false" data-hsisproductrecclick="true" style="display: none;">' +
            '                   <span class="QuickLookIcon"></span>' +
            '                   <span class="QuickLookText">%%QuickBuyText%%</span>' +
            "               </div>" +
            "           {{/if}}" +
            "           {{#if %%WishListEnabled%%}}" +
            '               <div class="hotspotbuy hotspotwishlist" data-colourvariantid="{{productId}}" data-hsshowallcolours="false" data-iswishlist="true" data-hsisproductrecclick="true" data-userloggedin="%%UserLoggedIn%%" style="display: none;">' +
            '                   <span class="WishIcon"></span>' +
            '                   <span class="WishText">%%WishListText%%</span>' +
            "               </div>" +
            "           {{/if}}" +
            "   		<h4>" +
            '   		    <a href="{{url}}">' +
            '                   <span class="PSProdBrand"><span class="wrap">{{brand}}</span></span>' +
            '   		    	<span class="PSProdTitle"><span class="wrap">{{name}}</span></span>' +
            "   		    </a>" +
            "           </h4>" +
            '   		<div class="PSProdPrice">' +
            '   		    <div class="PSFromSell">' +
            '   			    {{#fromPrice}}<span class="PSFrom">%%FROM%%</span>{{/fromPrice}} <span class="PSSellPrice">{{sellPrice}}</span>' +
            "   		    </div>" +
            '               {{#if additionalPriceLabel}}<span class="AdditionalPriceLabel">{{additionalPriceLabel}}</span>{{/if}}' +
            "   			{{#hasRefPrice}}" +
            '   			<div class="PSTicketSell">' +
            '   				{{#showTicketPricePrefix}}<span class="ticketPricePrefix">%%TPP%% </span>{{/showTicketPricePrefix}}' +
            '                   <span class="PSRefPrice">{{RefPrice}}</span>' +
            "   			</div>" +
            "   			{{/hasRefPrice}}" +
            "   		</div>" +
            "   	</div>" +
            "   </li>" +
            "   {{/products}}" +
            "</ul>" +
            '<div class="swiper-button-next ps-swiper-button-next"></div>' +
            '<div class="swiper-button-prev ps-swiper-button-prev"></div>' +
            "</div>" +
            '<div class="BlockDiv"></div></div></div> ',
    );
    /* END default template */
})(window.psTemplates || {});

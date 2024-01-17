// ==UserScript==
// @name         Vine Discord Poster
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  A tool to make posting to Discord easier
// @author       Discord: lelouch_di_britannia
// @match        https://www.amazon.com/vine/vine-items
// @match        https://www.amazon.com/vine/vine-items?queue=potluck*
// @match        https://www.amazon.com/vine/vine-items?queue=last_chance*
// @match        https://www.amazon.com/vine/vine-items?queue=encore*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @updateURL    https://raw.githubusercontent.com/xalavar/vine-product-sharing/main/brenda-product-share.user.js
// @downloadURL  https://raw.githubusercontent.com/xalavar/vine-product-sharing/main/brenda-product-share.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

/*

NOTES:
* Your API token is tied to your Discord username.

*/

(function() {
    'use strict';

    const API_TOKEN = ""; // <<-- Replace with your own user token obtained in the Discord server ("/api-token")

    /* ^ EVERYTHING NORMAL USERS NEED IS ABOVE HERE ^ */

    const urlData = window.location.href.match(/(amazon..+)\/vine\/vine-items\?queue=(encore|last_chance|potluck).*$/); // Country and queue type are extrapolated from this

    // The individual icons for the Share button
    const btn_discordSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -15 130 130" style="height: 25px;width: 26px;margin-right: 4px;">
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" style="fill: #5865f2;"></path>
    </svg>`;
    const btn_loadingAnim = `<span class="a-spinner a-spinner-small" style="margin-right: 5px;"></span>`;
    const btn_checkmark = `<span class='a-button-discord a-button-discord-success' style='background-image: url(https://m.media-amazon.com/images/S/sash/ZNt8quAxIfEMMky.png); background-position: -83px -137px; content: ""; padding: 10px 10px 10px 10px; background-size: 512px 512px; background-repeat: no-repeat; margin-right: 5px; vertical-align: middle;'></span>`;

    (GM_getValue("config")) ? GM_getValue("config") : GM_setValue("config", {}); // initialize the list of items that were posted to Discord

    function writeComment(productData) {

        var comment = '';
        comment += (productData.isLimited) ? "<:limited_ltd:1117538207362457611> Limited <:limited_ltd:1117538207362457611>" : '';
        // More coming soon...
        return comment;

    }

    function addShareButton() {
        var discordBtn = `<button class="a-button-discord" aria-label="Post to Discord" style="align-items: center; height: 31px;"></button>`;
        var btnHeader = document.querySelector('.vvp-modal-footer');
        btnHeader.insertAdjacentHTML('afterbegin', discordBtn);
    }

    function updateButton(type) {
        var discordBtn = document.querySelector('.a-button-discord');
        if (type == 0) { // default
            discordBtn.innerHTML = `${btn_discordSvg} Share on Discord`;
            discordBtn.disabled = false;
            discordBtn.style.cursor = 'pointer';
        } else if (type == 1) { // submit button is clicked and waiting for API result
            discordBtn.innerHTML = `${btn_loadingAnim} Submitting...`;
            discordBtn.disabled = true;
            discordBtn.style.cursor = 'no-drop';
        } else if (type == 2) { // API: success
            discordBtn.innerHTML = `${btn_checkmark} Done!`;
            discordBtn.disabled = true;
        } else if (type == 3) { // API: posting too quickly
            discordBtn.innerHTML = `Sharing too quickly!`;
            discordBtn.disabled = false;
            discordBtn.style.cursor = 'pointer';
        } else if (type == 4) { // Item was already posted to Discord
            discordBtn.innerHTML = `Already posted`;
            discordBtn.disabled = true;
            discordBtn.style.cursor = 'no-drop';
        } else if (type == 5) { // API: invalid token
            discordBtn.innerHTML = `Invalid token`;
            discordBtn.disabled = true;
            discordBtn.style.cursor = 'no-drop';
        } else if (type == 6) { // API: incorrect parameters
            discordBtn.innerHTML = `Something went wrong`;
        }

    }

    // Function to send the PUT request
    function sendDataToAPI(data) {

        const formData = new URLSearchParams({
            version: 1,
            token: API_TOKEN,
            domain: urlData[1],
            tab: data.queue,
            asin: data.asin,
            etv: data.etv,
            comment: data.comments,
        });

        updateButton(1);
        var listOfItems = GM_getValue('config');

        // Send the PUT request
        GM_xmlhttpRequest({
            method: "PUT",
            url: "https://api.llamastories.com/brenda/product",
            data: formData.toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            onload: function(response) {
                console.log(response.status, response.responseText);
                if (response.status == 200) { // successfully posted to Discord
                    listOfItems[data.asin] = {};
                    listOfItems[data.asin].status = 'Posted';
                    listOfItems[data.asin].queue = data.queue;
                    listOfItems[data.asin].date = new Date().getTime();
                    updateButton(2);
                } else if (response.status == 401) { // invalid token
                    updateButton(5);
                } else if (response.status == 422) { // incorrect parameters; API might have been updated
                    updateButton(6);
                } else if (response.status == 429) { // too many requests
                    updateButton(3);
                }

                GM_setValue('config', listOfItems);
            },
            onerror: function(error) {
                console.error(error);
                updateButton(6);
            },
        });

    }

    // Determining the queue type from the HTML dom
    function d_queueType(text) {
        switch (text) {
            case "VENDOR_TARGETED":
                return "potluck"; // RFY
            case "VENDOR_VINE_FOR_ALL":
                return "last_chance"; // AFA
            case "VINE_FOR_ALL":
                return "encore"; // AI
            default:
                return null;
        }

    }

    const errorMessages = document.querySelectorAll('#vvp-product-details-error-alert, #vvp-out-of-inventory-error-alert');

    let parentAsin, queueType;

    // As much as I hate this, this adds event listeners to all of the "See details" buttons
    document.querySelectorAll('.a-button-primary.vvp-details-btn > .a-button-inner > input').forEach(function(element) {
        element.addEventListener('click', function() {

            parentAsin = this.getAttribute('data-asin');
            queueType = urlData?.[2] || d_queueType(this.getAttribute('data-recommendation-type'));

            // silencing console errors; a null error is inevitable with this arrangement; I might fix this in the future
            try {
                document.querySelector("button.a-button-discord").style.display = 'none'; // hiding the button until the modal content loads
            } catch (error) {
            }
        });
    });


    window.addEventListener('load', function () {
        var target, observer, config;

        target = document.querySelector("a#vvp-product-details-modal--product-title");
        config = {
            characterData: false,
            attributes: true,
            childList: false,
            subtree: false
        };

        // Triggers when the Discord button is clicked
        function buttonClickListener() {

            // Prepping data to be sent to the API
            var productData = {};
            var modalAsin = document.querySelector("a#vvp-product-details-modal--product-title").href.match(/amazon..+\/dp\/([A-Z0-9]+).*$/)[1];
            productData.variations = null; // TO-DO
            productData.isLimited = (document.querySelector('#vvp-product-details-modal--limited-quantity').style.display !== 'none') ? true : false;
            productData.asin = parentAsin;
            productData.differsFromModal = (parentAsin !== modalAsin) ? true : false; // comparing the asin loaded in the modal to the one on the webpage
            productData.etv = document.querySelector("#vvp-product-details-modal--tax-value-string")?.innerText.replace("$", "");
            productData.queue = queueType;
            productData.comments = writeComment(productData);

            // add in some other things to do...

            sendDataToAPI(productData);
        }

        // Mutation observer fires every time the product title in the modal changes
        observer = new MutationObserver(function (mutations) {
            if (!document.querySelector('.a-button-discord')) {
                addShareButton();
            }

            document.querySelector("button.a-button-discord").style.display = 'inline-flex';

            // remove pre-existing event listener before creating a new one
            document.querySelector("button.a-button-discord")?.removeEventListener("click", buttonClickListener);

            // making sure there aren't any errors in the modal
            var hasError = !Array.from(errorMessages).every(function(elem) {
                return elem.style.display === 'none';
            });
            var wasPosted = GM_getValue("config")[parentAsin]?.queue;
            var isModalHidden = (document.querySelector("a#vvp-product-details-modal--product-title").style.visibility === 'hidden') ? true : false;

            if (hasError) {
                // Hide the Share button; no need to show it when there are errors
                document.querySelector("button.a-button-discord").style.display = 'none';
            } else if (wasPosted === queueType) {
                // Product was already posted from the same queue before
                updateButton(4);
            } else if (!isModalHidden) {

                updateButton(0);
                document.querySelector("button.a-button-discord").addEventListener("click", buttonClickListener);
            }

        });

        observer.observe(target, config);

    });

})();

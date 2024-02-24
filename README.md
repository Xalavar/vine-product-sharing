# Vine 1-CAP (1-Click Auto Poster)
A tool to help make sharing items on Vine to Discord with the click of a button! It is designed to work with Thorvarium's API so users can post new products to the Discord server.

![demo_of_script](https://github.com/Xalavar/vine-product-sharing/assets/41214918/3dbf1e76-7df6-4a18-ae70-7264d2d3a18b)

Output:

![image](https://github.com/Xalavar/vine-product-sharing/assets/41214918/9f8b0610-f98e-46a2-adf2-343f89f7717e)

(Note: This script does not generate a Discord embed or pull product images.)

# What it does:

This script basically compiles the product information loaded onto the page and sends it over an API call to the Vine member exclusive Discord server.

Here's a list of things it pulls from each product:

* ETV (Estimated Taxable Value)
* Seller name
* Dropdown names
* Dropdown options
* Limited quantity

# Compatibility

1-CAP is configured to work in the US, UK, and Canada. However, it can be used for other countries as well, with some tweaking.

Browsers:
* Chrome ✅
* Firefox ✅
* Edge ✅

Platforms:
* PC ✅
* iOS ✅
* Android ✅

Extensions:
* Tampermonkey
* Violentmonkey
* Greasemonkey (use Tampermonkey if you're experiencing issues with this one)

# FAQ

**Q**: Can I use this for a different Discord server?

**A**: Yes, but you'll likely need to make some modifications and possibly add your own code. If this is something you want to do, I would suggest forking this repository so you can keep your version up to date. You'd also need an API and a server to help manage the data that gets sent to your Discord server.

**Q**: Could I get kicked out of Vine for using this?

**A**: No. This is 100% safe to use and won't trip up Amazon's bot detection because it's only reading information on the page and not interacting with Amazon's servers in any way.

**Q**: How do I get invited to Vi—

**A**: No.

# Credits

lelouch_di_britannia (me) (Discord)

thorvarium (Discord) - For the API



Please ask for permission before using this in your own code!

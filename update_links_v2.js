const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// Update the $369 button link
// Unique link identified: https://buy.stripe.com/bJefZidm23JbfubeCseQM06
const link369Old = 'https://buy.stripe.com/bJefZidm23JbfubeCseQM06';
const link369New = 'https://whop.com/checkout/2WFm599TVzuRMPpaKd-nUWJ-Jau9-DHpD-OxKNinsHfu5x/';

if (content.includes(link369Old)) {
    content = content.replace(new RegExp(link369Old, 'g'), link369New);
    console.log('Updated $369 button link.');
} else {
    console.log('Warning: $369 button link not found.');
}

// Update $20 button links
const link20New = 'https://whop.com/checkout/FRvXKZdip05G2UuK5-6drg-hzm2-khlj-2NeS5LP9hnlF/';

// Regex to find <a> tags containing "20$"
// We capture the opening tag, the content, and the closing tag
// This is a bit complex because we need to parse attributes.
// Instead of full parsing, let's use a replace with a callback function on the <a> tag regex.

// Regex to match <a>...</a> blocks. 
// Note: This assumes no nested <a> tags, which is standard HTML.
const anchorRegex = /<a\b([^>]*)>(.*?)<\/a>/gs;

let count20 = 0;

content = content.replace(anchorRegex, (match, attributes, innerContent) => {
    // Check if the inner content has "20$" or "$20"
    if (innerContent.includes('20$') || innerContent.includes('$20')) {
        // This is a target button
        
        // Update href
        let newAttributes = attributes.replace(/href=["'][^"']*["']/, `href="${link20New}"`);
        
        // Update id if it looks like a URL (some buttons have id="https://...")
        if (attributes.includes('id="http')) {
             newAttributes = newAttributes.replace(/id=["'][^"']*["']/, `id="${link20New}"`);
        }
        
        count20++;
        return `<a${newAttributes}>${innerContent}</a>`;
    }
    return match;
});

console.log(`Updated ${count20} buttons with price $20.`);

fs.writeFileSync(filePath, content, 'utf8');

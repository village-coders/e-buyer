
$filePath = "c:\Users\awwal\Downloads\www.ebuyer.com\www.ebuyer.com\index.html"
$content = Get-Content -Path $filePath -Raw
$paypalLink = "https://www.paypal.com/ncp/payment/2GAB24XPDUEPW"
$placeholder = "___PAYPAL_LINK_PLACEHOLDER___"

# 1. Protect the PayPal link
$content = $content.Replace($paypalLink, $placeholder)

# 2. Disable all <a> hrefs
# We use a regex that matches href="..." or href=... (unquoted)
# but only inside <a> tags.
# This is still the tricky part.

# Alternative: just replace all hrefs in the whole file, but SKIP <link> and <script> tags.
# Actually, if I protect the PayPal link, I can just replace all hrefs that look like links.

# Let's use a more precise regex for <a> tags.
$content = [regex]::Replace($content, '(?si)<a\s+([^>]*?)href=(["'']?)(.*?)\2([^>]*?)>', {
    param($m)
    $attr1 = $m.Groups[1].Value
    $quote = $m.Groups[2].Value
    $href = $m.Groups[3].Value
    $attr2 = $m.Groups[4].Value
    
    if ($href -eq $placeholder) {
        return $m.Value
    }
    return "<a $($attr1)href=""javascript:void(0)""$($attr2)>"
})

# 3. Disable all buttons
# Check if they already have onclick="return false;" to avoid duplicates
$content = $content -replace '(?i)<button', '<button onclick="return false;"'
# Remove duplicates if any
$content = $content -replace 'onclick="return false;" onclick="return false;"', 'onclick="return false;"'

# 4. Restore the PayPal link
$content = $content.Replace($placeholder, $paypalLink)

Set-Content -Path $filePath -Value $content -Encoding UTF8


$filePath = "c:\Users\awwal\Downloads\www.ebuyer.com\www.ebuyer.com\index.html"
$content = Get-Content -Path $filePath -Raw

# Replace all hrefs in <a> tags that don't contain the PayPal link
$paypalLink = "https://www.paypal.com/ncp/payment/2GAB24XPDUEPW"

# Regex to find <a> tags and their hrefs
# This is a bit complex for regex, but we can do it line by line or use a more sophisticated approach.
# A simpler way is to just target any href="..." and replace it if it's not the paypal one.

# Let's use a regex that matches href="..."
# and use a MatchEvaluator to check the content.

$callback = {
    param($match)
    $fullHref = $match.Groups[0].Value
    $url = $match.Groups[1].Value
    if ($url -eq $paypalLink -or $url.Contains("javascript:void(0)")) {
        return $fullHref
    } else {
        return 'href="javascript:void(0)"'
    }
}

$newContent = [regex]::Replace($content, 'href="([^"]*)"', $callback)

# Also disable all buttons except maybe ones we want to keep (though user said ALL buttons except buy now)
# We can add onclick="return false;" to all <button> tags.
# But wait, some buttons might not have onclick yet.

$newContent = $newContent -replace '<button', '<button onclick="return false;"'

# We should also ensure the <a> tags we want to keep DON'T have return false.
# But our regex above already skipped them.

# One more thing: some links might use ' instead of "
$callbackSingle = {
    param($match)
    $fullHref = $match.Groups[0].Value
    $url = $match.Groups[1].Value
    if ($url -eq $paypalLink -or $url.Contains("javascript:void(0)")) {
        return $fullHref
    } else {
        return "href='javascript:void(0)'"
    }
}
$newContent = [regex]::Replace($newContent, "href='([^']*)'", $callbackSingle)

Set-Content -Path $filePath -Value $newContent -Encoding UTF8

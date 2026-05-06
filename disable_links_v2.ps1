
$filePath = "c:\Users\awwal\Downloads\www.ebuyer.com\www.ebuyer.com\index.html"
$content = Get-Content -Path $filePath -Raw
$paypalLink = "https://www.paypal.com/ncp/payment/2GAB24XPDUEPW"

# Use regex to find <a> tags and replace their href
# Regex for <a> tag: <a\s+[^>]*href=["']([^"']*)["'][^>]*>
# We need to be careful with multi-line tags.
$callback = {
    param($match)
    $fullTag = $match.Value
    $href = $match.Groups[1].Value
    # If it's already a javascript link or the paypal link, leave it
    if ($href -eq $paypalLink -or $href.Contains("javascript:void(0)")) {
        return $fullTag
    }
    # Replace the href attribute value
    # We use a sub-regex to find the href and replace it
    $newTag = [regex]::Replace($fullTag, 'href=["''][^"'']*["'']', 'href="javascript:void(0)"')
    return $newTag
}

# Regex to match <a> tags, including multi-line
$regex = New-Object regex('<a\s+[^>]*href=["'']([^"']*)["''][^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
$newContent = $regex.Replace($content, $callback)

# Disable all buttons
# Skip buttons that might be needed? User said ALL.
# The Buy Now "button" is actually an <a> tag.
$newContent = $newContent -replace '<button', '<button onclick="return false;"'

Set-Content -Path $filePath -Value $newContent -Encoding UTF8

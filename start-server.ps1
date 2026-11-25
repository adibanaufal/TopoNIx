param(
  [int]$Port = 8080
)

$Root = $PSScriptRoot
$Prefix = "http://localhost:$Port/"

$MimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.jsx'  = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.sql'  = 'text/plain; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.ico'  = 'image/x-icon'
}

$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add($Prefix)
$Listener.Start()
Write-Host "TopoNix SMKN 1 Bojonegoro berjalan di $Prefix (Tekan Ctrl+C untuk berhenti)"

try {
  while ($Listener.IsListening) {
    $Context = $Listener.GetContext()
    $Request = $Context.Request
    $Response = $Context.Response

    $RelPath = $Request.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($RelPath)) { $RelPath = 'index.html' }
    $FullPath = Join-Path $Root ($RelPath -replace '/', '\')

    if ((Test-Path $FullPath) -and -not (Get-Item $FullPath).PSIsContainer) {
      $Ext = [System.IO.Path]::GetExtension($FullPath).ToLower()
      $Response.ContentType = if ($MimeTypes.ContainsKey($Ext)) { $MimeTypes[$Ext] } else { 'application/octet-stream' }
      $Bytes = [System.IO.File]::ReadAllBytes($FullPath)
      $Response.ContentLength64 = $Bytes.Length
      $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
    } else {
      $Response.StatusCode = 404
      $Msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $Response.OutputStream.Write($Msg, 0, $Msg.Length)
    }
    $Response.OutputStream.Close()
  }
} finally {
  $Listener.Stop()
}

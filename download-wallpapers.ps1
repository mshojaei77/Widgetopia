# PowerShell script to download wallpapers for the app

$wallpaperDir = "public\wallpapers"

# Create directory if it doesn't exist
if (!(Test-Path $wallpaperDir)) {
    New-Item -ItemType Directory -Path $wallpaperDir -Force
}

# Wallpaper URLs - using free high-quality images from Unsplash
$wallpapers = @{
    "default.jpg" = "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2848&auto=format&fit=crop"
    "forest.jpg" = "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2940&auto=format&fit=crop"
    "mountains.jpg" = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2940&auto=format&fit=crop"
    "ocean.jpg" = "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2940&auto=format&fit=crop"
    "night.jpg" = "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2940&auto=format&fit=crop"
}

# Download each wallpaper
foreach ($wallpaper in $wallpapers.GetEnumerator()) {
    $outputFile = Join-Path $wallpaperDir $wallpaper.Key
    Write-Host "Downloading $($wallpaper.Key)..."
    Invoke-WebRequest -Uri $wallpaper.Value -OutFile $outputFile
    Write-Host "Downloaded to $outputFile"
}

Write-Host "All wallpapers downloaded successfully!" 
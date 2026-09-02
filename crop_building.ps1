Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("c:\VIC\vic\public\reference_hero_crop.png")

# Building starts around x=180 to the right edge (615), and y=40 to 235
$rect = New-Object System.Drawing.Rectangle(180, 35, 435, 205)
$buildingCrop = $bmp.Clone($rect, $bmp.PixelFormat)
$buildingCrop.Save("c:\VIC\vic\public\hero_building_ref.png", [System.Drawing.Imaging.ImageFormat]::Png)
$buildingCrop.Dispose()
$bmp.Dispose()
Write-Host "Building crop saved"

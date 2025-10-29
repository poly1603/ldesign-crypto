# PowerShell 构建验证脚本

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  @ldesign/crypto 构建验证脚本" -ForegroundColor Blue
Write-Host "========================================`n" -ForegroundColor Blue

$StartTime = Get-Date
$TotalPackages = 0
$SuccessPackages = 0
$FailedPackages = @()

# 进入 crypto 目录
Set-Location $PSScriptRoot

Write-Host "📦 开始构建所有包...`n" -ForegroundColor Blue

# 构建核心包
Write-Host "[1/8] 构建 @ldesign/crypto-core..." -ForegroundColor Yellow
Set-Location packages\core
$TotalPackages++

try {
    pnpm build 2>&1 | Out-Null
    Write-Host "✓ core 构建成功" -ForegroundColor Green
    $SuccessPackages++
    
    if ((Test-Path "es") -and (Test-Path "lib")) {
        Write-Host "  ✓ 输出目录: es/ lib/ dist/" -ForegroundColor Green
    }
}
catch {
    Write-Host "✗ core 构建失败" -ForegroundColor Red
    $FailedPackages += "core"
}

Set-Location ..\..

# 构建 Vue 包
Write-Host "`n[2/8] 构建 @ldesign/crypto-vue..." -ForegroundColor Yellow
Set-Location packages\vue
$TotalPackages++

try {
    pnpm build 2>&1 | Out-Null
    Write-Host "✓ vue 构建成功" -ForegroundColor Green
    $SuccessPackages++
}
catch {
    Write-Host "✗ vue 构建失败" -ForegroundColor Red
    $FailedPackages += "vue"
}

Set-Location ..\..

# 构建 React 包
Write-Host "`n[3/8] 构建 @ldesign/crypto-react..." -ForegroundColor Yellow
Set-Location packages\react
$TotalPackages++

try {
    pnpm build 2>&1 | Out-Null
    Write-Host "✓ react 构建成功" -ForegroundColor Green
    $SuccessPackages++
}
catch {
    Write-Host "✗ react 构建失败" -ForegroundColor Red
    $FailedPackages += "react"
}

Set-Location ..\..

# 其他包...
Write-Host "`n[4/8] 构建 @ldesign/crypto-solid..." -ForegroundColor Yellow
Set-Location packages\solid
$TotalPackages++

try {
    pnpm build 2>&1 | Out-Null
    Write-Host "✓ solid 构建成功" -ForegroundColor Green
    $SuccessPackages++
}
catch {
    Write-Host "✗ solid 构建失败" -ForegroundColor Red
    $FailedPackages += "solid"
}

Set-Location ..\..

# 运行测试
Write-Host "`n========================================" -ForegroundColor Blue
Write-Host "🧪 运行测试..." -ForegroundColor Blue
Write-Host "========================================`n" -ForegroundColor Blue

Write-Host "测试 @ldesign/crypto-core..." -ForegroundColor Yellow
Set-Location packages\core

try {
    pnpm test:run 2>&1 | Out-Null
    Write-Host "✓ core 测试通过" -ForegroundColor Green
}
catch {
    Write-Host "✗ core 测试失败" -ForegroundColor Red
}

Set-Location ..\..

# 输出总结
$Duration = (Get-Date) - $StartTime

Write-Host "`n========================================" -ForegroundColor Blue
Write-Host "📊 构建总结" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host "总包数: $TotalPackages"
Write-Host "成功: $SuccessPackages" -ForegroundColor Green
Write-Host "失败: $($TotalPackages - $SuccessPackages)" -ForegroundColor Red

if ($FailedPackages.Count -gt 0) {
    Write-Host "`n失败的包:" -ForegroundColor Red
    foreach ($pkg in $FailedPackages) {
        Write-Host "  - $pkg"
    }
}

Write-Host "`n⏱️  总耗时: $([math]::Round($Duration.TotalSeconds, 2))s"

if ($SuccessPackages -eq $TotalPackages) {
    Write-Host "`n🎉 所有包构建成功！" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "`n⚠️  部分包构建失败，请检查错误信息" -ForegroundColor Yellow
    exit 1
}


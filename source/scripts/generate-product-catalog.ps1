param(
  [string]$KnowledgeBase = 'D:\尖锋食客产品主图知识库',
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$summary = Import-Csv -LiteralPath (Join-Path $KnowledgeBase '产品汇总.csv') -Encoding UTF8
$mechanisms = Import-Csv -LiteralPath (Join-Path $KnowledgeBase '产品机制表.csv') -Encoding UTF8
$mechanismByName = @{}
foreach ($row in $mechanisms) { $mechanismByName[$row.'产品名称'] = $row }

$imageDir = Join-Path $ProjectRoot 'public\images\catalog'
New-Item -ItemType Directory -Force -Path $imageDir | Out-Null

function Clamp([double]$n) { [math]::Max(0, [math]::Min(100, [math]::Round($n))) }
function Build-Vector([string]$name) {
  $v = [ordered]@{ meat=30; spicy=20; sweet=28; savory=50; healthy=52; adventurous=48; convenience=65; value=58; stockup=55; social=55 }
  $rules = @(
    @{p='牛|猪|鸡|鸭|肉|肠|排|凤爪|鱼|虾|丸|舌|蹄|翅'; d=@{meat=45;savory=25;healthy=-12}},
    @{p='辣|麻|藤椒|火锅|酸菜|香辣|椒'; d=@{spicy=55;savory=20;adventurous=12}},
    @{p='蛋糕|曲奇|饼干|甜|巧克力|奶冻|布丁|糖|黄桃|榴莲'; d=@{sweet=48;savory=-18}},
    @{p='牛奶|酸奶|乳|奶酪'; d=@{sweet=22;healthy=20;convenience=16}},
    @{p='全麦|黑麦|燕麦|藕粉|梨膏|桑葚|坚果|蔬|菌|山药'; d=@{healthy=34;meat=-18}},
    @{p='米线|面|馅饼|包|饺|手抓饼|小笼|饭'; d=@{savory=25;convenience=24;value=12;stockup=12}},
    @{p='礼盒|分享|家庭|组合|箱|大礼包'; d=@{social=30;stockup=30;value=12}},
    @{p='新|限定|异域|榴莲|咖喱|意大利|泰式'; d=@{adventurous=30}}
  )
  foreach($r in $rules){ if($name -match $r.p){ foreach($k in $r.d.Keys){ $v[$k]=Clamp($v[$k]+$r.d[$k]) } } }
  return $v
}
function Guess-Category([string]$name) {
  if($name -match '奶|乳|酸奶'){'乳品'} elseif($name -match '蛋糕|面包|吐司|曲奇|饼干|蛋卷'){'烘焙甜点'} elseif($name -match '牛|猪|鸡|鸭|肉|肠|凤爪|鱼|虾|丸'){'肉类即食'} elseif($name -match '米线|面|饭|馅饼|包|饺|手抓饼'){'方便主食'} elseif($name -match '汁|饮|茶|膏'){'饮品冲调'} else {'休闲食品'}
}
function Slug([string]$value, [int]$index) {
  $safe = ($value -replace '[^a-zA-Z0-9\u4e00-\u9fff]+','-').Trim('-').ToLowerInvariant()
  if(-not $safe){$safe="product-$index"}; return ("{0:d3}-{1}" -f $index,$safe)
}

function Get-ImageScore([string]$path) {
  try {
    $image = [System.Drawing.Image]::FromFile($path)
    try {
      $ratio = $image.Width / [math]::Max(1, $image.Height)
      $squareScore = 42 * (1 - [math]::Min(1, [math]::Abs([math]::Log($ratio))))
      $sizeScore = if([math]::Min($image.Width,$image.Height) -ge 700){12}elseif([math]::Min($image.Width,$image.Height) -ge 500){7}else{0}
    } finally { $image.Dispose() }
    $score = $squareScore + $sizeScore
    if($path -match '[\\/]主图[\\/]'){ $score += 34 }
    if([IO.Path]::GetFileNameWithoutExtension($path) -match '主图\s*1|主图1|主图-800|画板\s*1(?!\d)'){ $score += 18 }
    if($path -match '详情页|产品信息|购买须知|营养|参数|温馨提示|长图'){ $score -= 30 }
    return $score
  } catch { return -999 }
}

function Select-ProductHero([string]$productRoot, [string]$fallback) {
  if(-not (Test-Path -LiteralPath $productRoot)){ return $fallback }
  $candidates = Get-ChildItem -LiteralPath $productRoot -Recurse -File | Where-Object { $_.Extension -match '^\.(jpg|jpeg|png|webp)$' }
  if(-not $candidates){ return $fallback }
  $ranked = $candidates | ForEach-Object { [pscustomobject]@{ Path=$_.FullName; Score=(Get-ImageScore $_.FullName) } } | Sort-Object Score -Descending
  $best = $ranked | Select-Object -First 1
  $fallbackScore = if(Test-Path -LiteralPath $fallback){ Get-ImageScore $fallback }else{-999}
  if($best.Score -ge ($fallbackScore + 12)){ return $best.Path }
  return $fallback
}

Add-Type -AssemblyName System.Drawing
$heroOverrideByIndex = @{
  1 = 'assets\4.0纯牛奶\详情页\2026-1月27日（直播汇总）_4_02_1eef4041.jpg'
  7 = 'assets\NFC桑葚汁\主图\2026-1月27日（直播汇总）_画板 1 拷贝 9-5_1936f91d.png'
  8 = 'assets\安格斯牛肉馅饼\主图\2026-1月27日（直播汇总）_主图3_099fd5f0.jpg'
  33 = 'assets\海鲜水饺礼盒\详情页\2026-1月27日（直播汇总）_海鲜水饺礼盒_画板-1_02_e08986b0.jpg'
  44 = 'assets\黑猪鲜肉肠（原味芝士玉米味）\详情页\2026-1月27日（直播汇总）_主图_fbfbd881.jpg'
}
$products = @()
$imageSelections = @()
$i = 0
foreach($row in $summary){
  $i++
  $name = $row.Product.Trim()
  $mechanism = $mechanismByName[$name]
  $rawPrice = if($mechanism){[string]$mechanism.'短视频挂车价'}else{''}
  $numbers = [regex]::Matches($rawPrice, '(?<!\d)(\d{1,4}(?:\.\d{1,2})?)(?!\d)') | ForEach-Object {[double]$_.Groups[1].Value}
  $price = if($numbers.Count){$numbers | Where-Object {$_ -ge 9 -and $_ -le 999} | Select-Object -First 1}else{$null}
  $promo = if($mechanism){[string]$mechanism.'短视频是否推广'}else{''}
  $availability = if($promo -match '短视频推广|上架'){'active'}elseif($promo -match '下架'){'inactive'}else{'unknown'}
  $slug = Slug $name $i
  $previewImage = Join-Path $KnowledgeBase ($row.Preview -replace '/','\')
  $sourceImage = if($heroOverrideByIndex.ContainsKey($i)){
    Join-Path $KnowledgeBase $heroOverrideByIndex[$i]
  }else{
    Select-ProductHero (Join-Path $KnowledgeBase ('assets\' + $name)) $previewImage
  }
  $imageSelections += [pscustomobject]@{
    Index = $i
    Product = $name
    PreviousPreview = $row.Preview
    SelectedPreview = $sourceImage.Substring($KnowledgeBase.Length).TrimStart('\') -replace '\\','/'
  }
  # ASCII-only asset names avoid Unicode filename corruption in ZIP-based static hosting.
  $targetName = ("product-{0:d3}.jpg" -f $i)
  $target = Join-Path $imageDir $targetName
  $img = [System.Drawing.Image]::FromFile($sourceImage)
  try {
    $width = [math]::Min(720, $img.Width)
    $height = [math]::Round($img.Height * $width / $img.Width)
    $bmp = New-Object System.Drawing.Bitmap($width,$height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    try {$g.DrawImage($img,0,0,$width,$height); $bmp.Save($target,[System.Drawing.Imaging.ImageFormat]::Jpeg)} finally {$g.Dispose();$bmp.Dispose()}
  } finally {$img.Dispose()}
  $vector = Build-Vector $name
  $evidence = @('商品名称语义','产品主图')
  if($row.Category){$evidence += '知识库分类'}
  if($rawPrice){$evidence += '2026-07-07渠道机制'}
  $dnaConfidence = 58 + [math]::Min(24,($evidence.Count-2)*8) + $(if($availability -eq 'active'){8}else{0})
  $products += [ordered]@{
    id=$slug; name=$name; subtitle="从尖锋完整货盘中按你的口味筛出"; description="来自尖锋食客产品主图知识库的真实产品。推荐由口味、场景与购买偏好共同计算。";
    price=$price; unit=$(if($rawPrice){($rawPrice -split "`n")[0]}else{'规格与价格待渠道同步'}); priceSource=$(if($rawPrice){'短视频机制表 · 更新 2026-07-07'}else{'知识库暂未记录公开渠道价'});
    image="/images/catalog/$targetName"; badge=$(if($availability -eq 'active'){'当前推广'}elseif($availability -eq 'inactive'){'历史产品'}else{'尖锋货盘'});
    externalUrl='https://shop180987765.youzan.com/v2/showcase/homepage?alias=9KajkhtOeV'; vector=$vector; category=(Guess-Category $name); availability=$availability; dnaConfidence=[int]$dnaConfidence; evidence=$evidence
  }
}

$jsonPath = Join-Path $ProjectRoot 'src\lib\products.generated.json'
$products | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $jsonPath -Encoding UTF8
$imageSelections | Export-Csv -LiteralPath (Join-Path $ProjectRoot 'design\catalog-audit\image-selections.csv') -NoTypeInformation -Encoding UTF8
Write-Output "Generated $($products.Count) products -> $jsonPath"


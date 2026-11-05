<?php
require __DIR__.'/config/bootstrap.php';
if (isset($_GET['lang']) && in_array($_GET['lang'],['en','ur'],true)) $_SESSION['lang']=$_GET['lang'];
$q=trim($_GET['q']??''); $products=Store::products($q,(int)($_GET['category']??0));
$cats=db()->query("SELECT id,name,slug FROM categories WHERE status='active' ORDER BY sort_order,name")->fetchAll();
?><!doctype html><html lang="<?=e(current_lang())?>" dir="<?=current_lang()==='ur'?'rtl':'ltr'?>"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title><?=e(setting('seo_title','Royal Mobile And Printing Store'))?></title>
<meta name="description" content="<?=e(setting('seo_description','Mobile accessories, printing and customized products in Pakistan'))?>">
<link rel="canonical" href="<?=e(($GLOBALS['config']['base_url']??'').'/')?>"><link rel="stylesheet" href="/assets/css/store.css">
<script type="application/ld+json"><?=json_encode(['@context'=>'https://schema.org','@type'=>'Store','name'=>setting('store_name','Royal Mobile And Printing Store'),'priceRange'=>'PKR','address'=>['@type'=>'PostalAddress','addressLocality'=>'Faisalabad','addressCountry'=>'PK']],JSON_UNESCAPED_SLASHES)?></script>
</head><body><header class="top"><a class="brand" href="/">ROYAL <small>Mobile & Printing Store</small></a><form class="search"><input name="q" value="<?=e($q)?>" placeholder="Search products, SKU..."><button>Search</button></form><nav><a href="/cart.php">Cart (<?=array_sum(Store::cart())?>)</a> <a href="/account/">Account</a> <a href="?lang=ur">اردو</a></nav></header>
<div class="strip">Faisalabad, Punjab, Pakistan · Cash on Delivery available</div>
<main><section class="hero"><div><span class="eyebrow">ROYAL ONLINE STORE</span><h1>Everything for mobile, printing & customization.</h1><p>Shop accessories, printing supplies and customized products.</p><a class="btn" href="#products">Shop products</a></div></section>
<div class="layout"><aside class="cats"><h3>Categories</h3><?php foreach($cats as $c):?><a href="?category=<?=(int)$c['id']?>"><?=e($c['name'])?></a><?php endforeach;?></aside>
<section id="products"><div class="sectionhead"><h2><?= $q ? 'Search results' : 'Featured & latest products' ?></h2><span><?=count($products)?> items</span></div><div class="grid"><?php foreach($products as $p):?><article class="product"><a href="/product.php?id=<?=(int)$p['id']?>"><?php if($p['image']):?><img src="/<?=e($p['image'])?>" alt="<?=e($p['name'])?>"><?php else:?><div class="placeholder">ROYAL</div><?php endif;?><h3><?=e($p['name'])?></h3></a><b><?=money($p['sale_price'] ?: $p['price'])?></b><?php if($p['sale_price']):?><del><?=money($p['price'])?></del><?php endif;?><form method="post" action="/cart.php"><?=Security::field()?><input type="hidden" name="product_id" value="<?=(int)$p['id']?>"><button>Add to cart</button></form></article><?php endforeach;?></div></section></div></main>
<footer>© <?=date('Y')?> Royal Mobile And Printing Store · <a href="/page.php?slug=privacy-policy">Privacy</a> · <a href="/page.php?slug=returns">Returns</a></footer></body></html>

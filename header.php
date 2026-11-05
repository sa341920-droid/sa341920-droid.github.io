<?php $pageTitle=$pageTitle??''; ?>
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title><?=site_title($pageTitle)?></title><meta name="description" content="<?=e($metaDescription??'Shop mobiles, printing supplies, sublimation products and customized gifts in Faisalabad, Pakistan.')?>">
<link rel="canonical" href="<?=e(url($_SERVER['REQUEST_URI']??''))?>"><meta property="og:site_name" content="<?=e(APP_NAME)?>"><meta property="og:title" content="<?=site_title($pageTitle)?>"><meta name="theme-color" content="#17243b">
<link rel="stylesheet" href="<?=url('assets/css/style.css')?>"><script>window.APP_URL=<?=json_encode(url())?>;</script></head><body>
<div class="topbar"><?=e(APP_NAME)?> · <?=e(APP_LOCATION)?> <span>WhatsApp / Call: <?=e(APP_PHONE)?></span></div>
<header class="header"><a class="brand" href="<?=url()?>"><span class="crown">♛</span><span><?=e(setting('store_name',APP_NAME))?></span></a>
<form class="search" action="<?=url('index.php')?>" method="get"><input type="hidden" name="page" value="search"><input name="q" placeholder="Search products, SKU, categories..." value="<?=e($_GET['q']??'')?>"><button>Search</button></form>
<nav><a href="<?=url('index.php?page=account')?>">My Account</a><a href="<?=url('index.php?page=wishlist')?>">Wishlist</a><a href="<?=url('index.php?page=cart')?>">Cart (<?=cart_count()?>)</a><?php if(current_user()): ?><a href="<?=url('index.php?page=logout')?>">Logout</a><?php else: ?><a href="<?=url('index.php?page=login')?>">Login</a><?php endif; ?></nav>
</header><div class="nav"><a href="<?=url()?>">Home</a><a href="<?=url('index.php?page=shop')?>">Shop All</a><a href="<?=url('index.php?page=categories')?>">Categories</a><a href="<?=url('index.php?page=deals')?>">Offers & Deals</a><a href="<?=url('index.php?page=track')?>">Track Order</a><a href="<?=url('index.php?page=contact')?>">Contact</a></div>
<main class="container"><?=flashes()?>

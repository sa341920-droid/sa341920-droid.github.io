<?php
require __DIR__.'/config/bootstrap.php';
$error='';
if($_SERVER['REQUEST_METHOD']==='POST'){Security::verify();try{
 $id=Store::checkout(['name'=>$_POST['name']??'','email'=>$_POST['email']??'','phone'=>$_POST['phone']??'','address'=>$_POST['address']??'','city'=>$_POST['city']??'','payment_method'=>in_array($_POST['payment_method']??'', ['cod','bank_transfer'],true)?$_POST['payment_method']:'cod','coupon'=>$_POST['coupon']??'','notes'=>$_POST['notes']??'']);
 redirect('/order-success.php?id='.$id);
 }catch(Throwable $e){$error=$e->getMessage();}}
?><!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Checkout</title><link rel="stylesheet" href="/assets/css/store.css"></head><body><main class="panel narrow"><h1>Secure checkout</h1><?php if($error):?><p class="error"><?=e($error)?></p><?php endif;?><form method="post"><?=Security::field()?><label>Full name<input name="name" required maxlength="120"></label><label>Email<input type="email" name="email" required></label><label>Phone<input name="phone" required pattern="[0-9+ -]{8,20}"></label><label>Full address<textarea name="address" required></textarea></label><label>City<input name="city" required></label><label>Coupon code (optional)<input name="coupon"></label><label>Payment method<select name="payment_method"><option value="cod">Cash on Delivery</option><option value="bank_transfer">Bank transfer (manual verification)</option></select></label><label>Order notes<textarea name="notes"></textarea></label><button>Place order</button></form></main></body></html>

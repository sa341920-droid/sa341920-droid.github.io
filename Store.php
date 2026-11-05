<?php
final class Store {
 public static function products(string $search='', int $category=0, int $limit=24): array {
  $sql="SELECT p.*, (SELECT image_path FROM product_images i WHERE i.product_id=p.id ORDER BY sort_order,id LIMIT 1) image FROM products p WHERE p.status='active'";
  $args=[];
  if ($search!=='') { $sql.=" AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)"; $v='%'.$search.'%'; array_push($args,$v,$v,$v); }
  if ($category>0) { $sql.=" AND p.category_id=?"; $args[]=$category; }
  $sql.=" ORDER BY p.featured DESC,p.created_at DESC LIMIT ".max(1,min($limit,100));
  $q=db()->prepare($sql); $q->execute($args); return $q->fetchAll();
 }
 public static function cart(): array { return $_SESSION['cart'] ?? []; }
 public static function addCart(int $id,int $qty): void {
  $q=db()->prepare("SELECT id,name,price,stock FROM products WHERE id=? AND status='active'"); $q->execute([$id]); $p=$q->fetch();
  if (!$p) throw new RuntimeException('Product unavailable');
  $new=(int)(self::cart()[$id] ?? 0)+max(1,$qty);
  if ($new>(int)$p['stock']) throw new RuntimeException('Insufficient stock');
  $_SESSION['cart'][$id]=$new;
 }
 public static function checkout(array $data): int {
  $cart=self::cart(); if (!$cart) throw new RuntimeException('Cart is empty');
  $pdo=db(); $pdo->beginTransaction();
  try {
   $ids=array_keys($cart); $marks=implode(',',array_fill(0,count($ids),'?'));
   $q=$pdo->prepare("SELECT id,name,price,stock FROM products WHERE id IN ($marks) FOR UPDATE"); $q->execute($ids); $rows=$q->fetchAll();
   if (count($rows)!==count($cart)) throw new RuntimeException('A product is no longer available');
   $total=0; foreach($rows as $p) { $qty=(int)$cart[$p['id']]; if($qty<1 || $qty>(int)$p['stock']) throw new RuntimeException('Stock changed; review your cart'); $total+=(float)$p['price']*$qty; }
   $shipping=(float)($data['shipping'] ?? 0); $discount=0;
   if (!empty($data['coupon'])) {
    $c=$pdo->prepare("SELECT * FROM coupons WHERE code=? AND status='active' AND starts_at<=NOW() AND (ends_at IS NULL OR ends_at>=NOW()) FOR UPDATE");
    $c->execute([strtoupper(trim($data['coupon']))]); $coupon=$c->fetch();
    if($coupon && ($coupon['usage_limit']===null || $coupon['used_count']<$coupon['usage_limit']) && $total >= $coupon['min_order']) {
     $discount=$coupon['discount_type']==='percent' ? $total*(float)$coupon['discount_value']/100 : (float)$coupon['discount_value'];
     $discount=min($discount,$total); $pdo->prepare('UPDATE coupons SET used_count=used_count+1 WHERE id=?')->execute([$coupon['id']]);
    }
   }
   $grand=max(0,$total+$shipping-$discount);
   $user=Auth::user();
   $q=$pdo->prepare("INSERT INTO orders(user_id,customer_name,email,phone,address,city,subtotal,shipping_total,discount_total,grand_total,payment_method,payment_status,order_status,notes) VALUES(?,?,?,?,?,?,?,?,?,?,?,'pending','pending',?)");
   $q->execute([$user['id']??null,trim($data['name']),trim($data['email']),trim($data['phone']),trim($data['address']),trim($data['city']),$total,$shipping,$discount,$grand,$data['payment_method'],$data['notes']??'']);
   $orderId=(int)$pdo->lastInsertId();
   foreach($rows as $p) {
    $qty=(int)$cart[$p['id']];
    $pdo->prepare('INSERT INTO order_items(order_id,product_id,product_name,sku,unit_price,quantity,line_total) VALUES(?,?,?,?,?,?,?)')->execute([$orderId,$p['id'],$p['name'],$p['sku'],$p['price'],$qty,$p['price']*$qty]);
    $pdo->prepare('UPDATE products SET stock=stock-? WHERE id=?')->execute([$qty,$p['id']]);
    $pdo->prepare("INSERT INTO stock_movements(product_id,quantity_change,reason,reference_id,user_id) VALUES(?,?,'sale',?,?)")->execute([$p['id'],-$qty,$orderId,$user['id']??null]);
   }
   $pdo->prepare("INSERT INTO payments(order_id,method,amount,status) VALUES(?,?,?,'pending')")->execute([$orderId,$data['payment_method'],$grand]);
   $pdo->commit(); unset($_SESSION['cart']); return $orderId;
  } catch(Throwable $e) { $pdo->rollBack(); throw $e; }
 }
}

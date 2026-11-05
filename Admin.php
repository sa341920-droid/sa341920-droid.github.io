<?php
final class Admin {
 public static function stats(): array {
  return [
   'sales'=>(float)db()->query("SELECT COALESCE(SUM(grand_total),0) FROM orders WHERE order_status<>'cancelled'")->fetchColumn(),
   'today'=>(float)db()->query("SELECT COALESCE(SUM(grand_total),0) FROM orders WHERE DATE(created_at)=CURDATE() AND order_status<>'cancelled'")->fetchColumn(),
   'orders'=>(int)db()->query("SELECT COUNT(*) FROM orders")->fetchColumn(),
   'pending'=>(int)db()->query("SELECT COUNT(*) FROM orders WHERE order_status IN ('pending','processing')")->fetchColumn(),
   'products'=>(int)db()->query("SELECT COUNT(*) FROM products")->fetchColumn(),
   'low_stock'=>(int)db()->query("SELECT COUNT(*) FROM products WHERE stock<=low_stock_threshold AND status='active'")->fetchColumn(),
   'expenses'=>(float)db()->query("SELECT COALESCE(SUM(amount),0) FROM expenses")->fetchColumn(),
  ];
 }
}

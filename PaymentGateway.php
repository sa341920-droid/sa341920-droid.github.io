<?php
interface PaymentGateway { public function createCheckout(array $order): array; public function verifyWebhook(array $headers,string $rawBody): array; }
final class DisabledGateway implements PaymentGateway {
 public function createCheckout(array $order): array { throw new RuntimeException('Payment provider is not configured. Use COD/manual verification.'); }
 public function verifyWebhook(array $headers,string $rawBody): array { throw new RuntimeException('Webhook verification adapter must be implemented and tested with official provider documentation.'); }
}

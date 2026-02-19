# CLICK Payment System - Integration Notes

> Fetched: 2026-02-19
> Source: https://docs.click.uz/en/merchant/

---

## Overview & Architecture

**System Participants:**
- CLICK Payment System — processes payments via USSD, SMS, Web, Mobile
- Supplier (Merchant) — legal entity with a billing system
- User — individual registered in CLICK system

**Two main integration families:**

| Family | Direction | Use Case |
|--------|-----------|----------|
| SHOP-API | CLICK → Merchant (callbacks) | CLICK calls Prepare/Complete on merchant server |
| Merchant-API | Merchant → CLICK (REST) | Merchant initiates invoices, card charges, status checks |

---

## SHOP-API (Callback-Based Flow)

Merchant hosts two endpoints (Prepare URL + Complete URL), configured at http://merchant.click.uz

**Payment flow:**
1. User initiates payment in CLICK app / SuperApp / USSD / Telegram
2. CLICK POSTs to **Prepare URL** (action=0) → merchant validates order, returns `merchant_prepare_id`
3. CLICK deducts funds from user account
4. CLICK POSTs to **Complete URL** (action=1) → merchant finalizes order, returns `merchant_confirm_id`

### Authentication — Signature Verification

Every SHOP-API request includes `sign_string` (MD5 hash). Merchant MUST verify it.

**Prepare signature:**
```
sign_string = MD5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time)
```

**Complete signature:**
```
sign_string = MD5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + merchant_prepare_id + amount + action + sign_time)
```

`sign_time` format: `"YYYY-MM-DD HH:mm:ss"`

Return `-1` if signature doesn't match.

---

### Prepare Request (action = 0)

Parameters CLICK sends to merchant (POST):

| Parameter | Type | Description |
|-----------|------|-------------|
| `click_trans_id` | bigint | Transaction ID in CLICK system |
| `service_id` | int | Your service ID |
| `click_paydoc_id` | bigint | Payment doc number (shown in user's SMS) |
| `merchant_trans_id` | varchar | Order/account ID in your billing system |
| `amount` | float | Payment amount in soums |
| `action` | int | 0 = Prepare |
| `error` | int | CLICK-side error (0 = ok) |
| `error_note` | varchar | Error description |
| `sign_time` | varchar | Signature timestamp |
| `sign_string` | varchar | MD5 hash to verify |

**Merchant response:**
```json
{
  "click_trans_id": 12345,
  "merchant_trans_id": "ORDER-001",
  "merchant_prepare_id": 9999,
  "error": 0,
  "error_note": "Success"
}
```

**Prepare logic:**
- Verify `sign_string`
- Check order exists → `-5` if not
- Check order not already paid → `-4` if already
- Check amount matches order amount → `-2` if mismatch
- Save `click_trans_id` + create `merchant_prepare_id` (reservation record)
- Return `merchant_prepare_id`

---

### Complete Request (action = 1)

Same params as Prepare, plus:

| Extra Parameter | Type | Description |
|----------------|------|-------------|
| `merchant_prepare_id` | int | The ID you returned in Prepare response |

**Merchant response:**
```json
{
  "click_trans_id": 12345,
  "merchant_trans_id": "ORDER-001",
  "merchant_confirm_id": 8888,
  "error": 0,
  "error_note": "Success"
}
```

**Complete logic:**
- Verify `sign_string`
- Find reservation by `merchant_prepare_id` → `-6` if not found
- If `error` from CLICK is `< 0` → cancel reservation, return `-9`
- Mark order as paid, return `merchant_confirm_id`
- Handle idempotency — CLICK may retry; don't double-process

---

## SHOP-API Error Codes (Merchant Returns These)

| Code | Meaning |
|------|---------|
| `0` | Success |
| `-1` | Sign check failed |
| `-2` | Incorrect parameter amount |
| `-3` | Action not found |
| `-4` | Already paid |
| `-5` | User/order does not exist |
| `-6` | Transaction (prepare_id) does not exist |
| `-7` | Failed to update user/order |
| `-8` | Error in request from CLICK (incomplete/invalid params) |
| `-9` | Transaction cancelled |

> Rule: if CLICK sends `error < 0` in Complete, cancel the reservation and return `-9`.

---

## Merchant API (Server-Initiated REST)

**Base URL:** `https://api.click.uz/v2/merchant/`

### Auth Header

```
Auth: {merchant_user_id}:{digest}:{timestamp}
```

- `timestamp` = 10-digit UNIX epoch (seconds)
- `digest` = `SHA1(timestamp + secret_key)`

**Content types:** `application/json` or `application/xml`

### Credentials (received from CLICK on registration)

- `merchant_id`
- `service_id`
- `merchant_user_id`
- `secret_key` — **KEEP PRIVATE, server-side only**

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/invoice/create` | Create invoice → sends push/SMS to user |
| GET | `/invoice/status/{service_id}/{invoice_id}` | Check invoice status |
| GET | `/payment/status/{service_id}/{payment_id}` | Check payment by CLICK payment ID |
| GET | `/payment/status_by_mti/{service_id}/{merchant_trans_id}/{YYYY-MM-DD}` | Check by your order ID |
| DELETE | `/payment/reversal/{service_id}/{payment_id}` | Reverse/cancel payment |
| POST | `/card_token/request` | Tokenize card (triggers OTP SMS) |
| POST | `/card_token/verify` | Confirm card token with OTP |
| POST | `/card_token/payment` | Charge using saved card token |
| DELETE | `/card_token/{service_id}/{card_token}` | Delete saved card token |
| POST | `/click_pass/payment` | CLICK Pass QR payment |

### Create Invoice

**POST** `https://api.click.uz/v2/merchant/invoice/create`

Request:
```json
{
  "service_id": 12345,
  "amount": 50000.0,
  "phone_number": "998901234567",
  "merchant_trans_id": "ORDER-001"
}
```

Response:
```json
{
  "error_code": 0,
  "error_note": "Success",
  "invoice_id": 987654
}
```

### Merchant API HTTP Status Codes

`200` OK, `201` Created, `400` Bad Request, `401` Unauthorized, `403` Forbidden,
`404` Not Found, `406` Not Acceptable, `410` Gone, `500` Server Error, `502` Service Down

---

## Payment Button (Redirect)

Redirect user to:
```
https://my.click.uz/services/pay?service_id={service_id}&merchant_id={merchant_id}&amount={amount}&transaction_param={merchant_trans_id}&return_url={return_url}
```

Optional: `card_type=uzcard` or `card_type=humo`

---

## Inline Card Payment (No Redirect)

Include script: `https://my.click.uz/pay/checkout.js`

```js
createPaymentRequest({
  service_id, merchant_id, amount, transaction_param, merchant_user_id, card_type
}, function(data) {
  // data.status: <0 = error, 0 = created, 1 = processing, 2 = completed
});
```

---

## Testing

1. Get CLICK's desktop emulator tool from merchant.click.uz
2. Configure: Prepare URL, Complete URL, service_id, merchant_user_id, secret_key, merchant_trans_id
3. Run all test scenarios — all must pass
4. Click "Generate Report" → submits to CLICK registration server
5. Confirm success at http://merchant.click.uz

---

## Security Checklist

- `SECRET_KEY` — server-side only, never exposed to client
- Always verify MD5 `sign_string` on every incoming SHOP-API request → return `-1` on failure
- SHA1 `digest` in Merchant-API `Auth` header with timestamp prevents replay attacks
- Use HTTPS for all callback URLs
- Validate `amount` in Prepare/Complete against your stored order amount
- Verify `merchant_prepare_id` in Complete matches what you issued in Prepare → return `-6` if not
- Handle idempotency — CLICK may retry; check if already processed before acting

---

## GitHub References

- PHP: https://github.com/click-llc/click-integration-php
- Django: https://github.com/click-llc/click-integration-django
- Merchant portal: http://merchant.click.uz

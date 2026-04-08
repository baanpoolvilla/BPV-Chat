# คู่มือการเชื่อมต่อแพลตฟอร์ม (Platform Sync Guide)

คู่มือนี้อธิบายวิธีการเชื่อมต่อ Baanpool Chatbot กับแพลตฟอร์มต่าง ๆ เพื่อรวมแชทมาไว้ในที่เดียว

---

## สารบัญ

- [1. LINE Official Account (LINE OA)](#1-line-official-account-line-oa)
- [2. Facebook Messenger](#2-facebook-messenger)
- [3. Instagram DM](#3-instagram-dm)
- [4. TikTok](#4-tiktok)
- [5. การเชื่อมต่อกับ N8N](#5-การเชื่อมต่อกับ-n8n)
- [6. Webhook Architecture](#6-webhook-architecture)
- [7. Environment Variables](#7-environment-variables)
- [8. Troubleshooting](#8-troubleshooting)

---

## 1. LINE Official Account (LINE OA)

### ข้อมูลที่ต้องใช้

| ข้อมูล | คำอธิบาย |
|--------|----------|
| Channel ID | รหัสช่องทาง |
| Channel Secret | รหัสลับของช่องทาง |
| Channel Access Token | Token สำหรับเรียก API (Long-lived) |

### ขั้นตอนการตั้งค่า

#### 1.1 สร้าง LINE Messaging API Channel

1. เข้าไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. ล็อกอินด้วยบัญชี LINE ของคุณ
3. กด **Create** เพื่อสร้าง **Provider** ใหม่ (หรือเลือก Provider ที่มีอยู่)
4. คลิก **Create a new channel** → เลือก **Messaging API**
5. กรอกข้อมูล:
   - Channel name: ชื่อบอทของคุณ
   - Channel description: คำอธิบาย
   - Category / Subcategory: เลือกตามประเภทธุรกิจ
6. กด **Create**

#### 1.2 คัดลอก Credentials

1. ไปที่แท็บ **Basic settings**:
   - คัดลอก **Channel ID**
   - คัดลอก **Channel secret**
2. ไปที่แท็บ **Messaging API**:
   - เลื่อนลงมาที่ส่วน **Channel access token**
   - กด **Issue** เพื่อสร้าง Long-lived token
   - คัดลอก token ที่ได้

#### 1.3 ตั้งค่า Webhook

1. ในแท็บ **Messaging API** → ส่วน **Webhook settings**
2. กรอก **Webhook URL**:
   ```
   https://your-domain.com/api/webhook/line
   ```
3. กด **Verify** เพื่อทดสอบ
4. เปิด **Use webhook** → ✅ Enabled
5. (แนะนำ) ปิด **Auto-reply messages** และ **Greeting messages** ในหน้า LINE Official Account Manager

#### 1.4 นำ Credentials มาใส่ในระบบ

ไปที่หน้า **ตั้งค่าการเชื่อมต่อ** (`/settings`) บนระบบ แล้วกรอก:
- Channel ID
- Channel Secret
- Channel Access Token

หรือตั้งผ่าน Environment Variables:
```env
LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
```

---

## 2. Facebook Messenger

### ข้อมูลที่ต้องใช้

| ข้อมูล | คำอธิบาย |
|--------|----------|
| Page ID | รหัสเพจ Facebook |
| App ID | รหัส Meta App |
| App Secret | รหัสลับของ App |
| Page Access Token | Token สำหรับเรียก API ของเพจ |
| Verify Token | รหัสยืนยัน Webhook (ตั้งเองได้) |

### ขั้นตอนการตั้งค่า

#### 2.1 สร้าง Meta App

1. เข้าไปที่ [Meta for Developers](https://developers.facebook.com/)
2. กด **My Apps** → **Create App**
3. เลือกประเภท **Business** → กด **Next**
4. กรอกชื่อ App → กด **Create App**
5. ในหน้า Dashboard → กด **Set Up** ที่ **Messenger**

#### 2.2 เชื่อมต่อ Facebook Page

1. ไปที่ **Messenger** → **Settings**
2. ส่วน **Access Tokens** → กด **Add or remove Pages**
3. เลือก Facebook Page ที่ต้องการเชื่อมต่อ
4. กด **Generate Token** → คัดลอก **Page Access Token**
5. จดบันทึก **Page ID** (แสดงในรายการเพจ)

#### 2.3 คัดลอก App Credentials

1. ไปที่ **Settings** → **Basic**
2. คัดลอก:
   - **App ID**
   - **App Secret** (กด Show เพื่อแสดง)

#### 2.4 ตั้งค่า Webhooks

1. ไปที่ **Messenger** → **Settings** → **Webhooks**
2. กด **Add Callback URL**
3. กรอก:
   - **Callback URL**: `https://your-domain.com/api/webhook/facebook`
   - **Verify Token**: ตั้งรหัสใดก็ได้ เช่น `my_verify_token_123`
4. กด **Verify and Save**
5. กด **Add Subscriptions** → เลือก:
   - ✅ `messages`
   - ✅ `messaging_postbacks`
   - ✅ `messaging_optins`

#### 2.5 ขอ Permission สำหรับ Production

1. ไปที่ **App Review** → **Permissions and Features**
2. ขอ permission: `pages_messaging`
3. ทำตามขั้นตอนรีวิวของ Meta

#### 2.6 นำ Credentials มาใส่ในระบบ

```env
FACEBOOK_PAGE_ID=your_page_id
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token
FACEBOOK_VERIFY_TOKEN=my_verify_token_123
```

---

## 3. Instagram DM

### ข้อกำหนดเบื้องต้น

- บัญชี Instagram ต้องเป็น **Business Account** หรือ **Creator Account**
- ต้องเชื่อมต่อ Instagram กับ **Facebook Page**
- ใช้ Meta App เดียวกับ Facebook ได้

### ข้อมูลที่ต้องใช้

| ข้อมูล | คำอธิบาย |
|--------|----------|
| IG Business Account ID | รหัสบัญชี Instagram Business |
| App ID | รหัส Meta App |
| App Secret | รหัสลับของ App |
| Access Token | Token ที่มี instagram_manage_messages permission |

### ขั้นตอนการตั้งค่า

#### 3.1 แปลงเป็น Business Account

1. เปิด Instagram App → **Settings** → **Account**
2. กด **Switch to Professional Account**
3. เลือก **Business**
4. เชื่อมต่อกับ Facebook Page

#### 3.2 ตั้งค่าใน Meta App

1. ไปที่ [Meta for Developers](https://developers.facebook.com/)
2. เปิด App ที่สร้างไว้ (หรือสร้างใหม่)
3. กด **Add Product** → เลือก **Instagram**
4. ไปที่ **Instagram** → **Basic Display** หรือ **Instagram API**

#### 3.3 สร้าง Access Token

1. ใช้ [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. เลือก App ของคุณ
3. ขอ permissions:
   - `instagram_manage_messages`
   - `instagram_basic`
   - `pages_manage_metadata`
4. กด **Generate Access Token**
5. แปลงเป็น Long-lived token:
   ```
   GET https://graph.facebook.com/v18.0/oauth/access_token
     ?grant_type=fb_exchange_token
     &client_id={APP_ID}
     &client_secret={APP_SECRET}
     &fb_exchange_token={SHORT_LIVED_TOKEN}
   ```

#### 3.4 หา IG Business Account ID

```
GET https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account
```

#### 3.5 ตั้งค่า Webhooks

1. ใน Meta App → **Webhooks** → **Instagram**
2. กด **Subscribe to this object**
3. กรอก:
   - **Callback URL**: `https://your-domain.com/api/webhook/instagram`
   - **Verify Token**: รหัสเดียวกับ Facebook
4. Subscribe fields: ✅ `messages`

#### 3.6 นำ Credentials มาใส่ในระบบ

```env
INSTAGRAM_ACCOUNT_ID=your_ig_business_account_id
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_ACCESS_TOKEN=your_access_token
```

---

## 4. TikTok

### ข้อควรทราบ

> ⚠️ TikTok Message API อยู่ใน **Beta** และอาจยังไม่พร้อมใช้งานในทุกภูมิภาค ตรวจสอบ availability ที่ [TikTok for Developers](https://developers.tiktok.com/)

### ข้อมูลที่ต้องใช้

| ข้อมูล | คำอธิบาย |
|--------|----------|
| Client Key | รหัส App |
| Client Secret | รหัสลับ App |
| Access Token | Token จาก OAuth |

### ขั้นตอนการตั้งค่า

#### 4.1 สร้าง TikTok App

1. เข้าไปที่ [TikTok for Developers](https://developers.tiktok.com/)
2. สมัคร Developer Account (ถ้ายังไม่มี)
3. กด **Manage Apps** → **Create App**
4. เลือกประเภท: **TikTok for Business**
5. กรอกข้อมูล App แล้วกด **Create**

#### 4.2 คัดลอก Credentials

1. ในหน้า **App Management** → คัดลอก:
   - **Client Key**
   - **Client Secret**

#### 4.3 ตั้งค่า OAuth & Webhooks

1. เพิ่ม **Redirect URI**: `https://your-domain.com/api/auth/tiktok/callback`
2. ตั้งค่า **Webhook URL**: `https://your-domain.com/api/webhook/tiktok`
3. เลือก Scopes:
   - `user.info.basic`
   - `message.read` (ถ้ามี)
   - `message.write` (ถ้ามี)

#### 4.4 ขอ Access Token ผ่าน OAuth

```
POST https://open.tiktokapis.com/v2/oauth/token/
Content-Type: application/x-www-form-urlencoded

client_key={CLIENT_KEY}
&client_secret={CLIENT_SECRET}
&code={AUTH_CODE}
&grant_type=authorization_code
&redirect_uri={REDIRECT_URI}
```

#### 4.5 นำ Credentials มาใส่ในระบบ

```env
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_ACCESS_TOKEN=your_access_token
```

---

## 5. การเชื่อมต่อกับ N8N

หากคุณใช้ **N8N** เป็น Bot/Backend อยู่แล้ว สามารถเชื่อมต่อกับ Dashboard นี้ได้โดยตรง

ดูคู่มือฉบับเต็มที่ **[N8N_INTEGRATION.md](./N8N_INTEGRATION.md)**

### สรุปย่อ

1. **สร้าง Webhook Nodes ใน N8N** ตาม API endpoints ที่ Dashboard ต้องการ
2. **ตั้งค่า `.env.local`** ให้ชี้ไปที่ N8N:
   ```env
   NEXT_PUBLIC_API_URL=http://your-n8n-url/webhook
   NEXT_PUBLIC_MOCK_MODE=false
   ```
3. **N8N รับ Webhook** จาก LINE/FB/IG/TikTok → บันทึก DB → ส่งเข้า AI → ตอบกลับ
4. **Dashboard แสดงแชท** → Admin ตอบ → N8N ส่งกลับไปแพลตฟอร์ม

---

## 6. Webhook Architecture

ระบบจะรับข้อความจากแต่ละแพลตฟอร์มผ่าน Webhook endpoints:

```
POST /api/webhook/line        ← LINE ส่งข้อความมา
POST /api/webhook/facebook    ← Facebook Messenger ส่งข้อความมา
POST /api/webhook/instagram   ← Instagram DM ส่งข้อความมา
POST /api/webhook/tiktok      ← TikTok ส่งข้อความมา
```

### Flow การทำงาน

```
ลูกค้าส่งข้อความ
    ↓
แพลตฟอร์ม (LINE/FB/IG/TikTok) ส่ง Webhook
    ↓
Backend รับข้อความ → normalize เป็น Message format กลาง
    ↓
ส่งเข้า AI Bot เพื่อตอบอัตโนมัติ (ถ้าเป็นโหมด bot)
    ↓
แจ้ง Admin ผ่าน Dashboard (Real-time via WebSocket)
    ↓
Admin ตอบกลับผ่าน Dashboard → Backend ส่งกลับไปแพลตฟอร์มต้นทาง
```

---

## 7. Environment Variables

สร้างไฟล์ `.env.local` ที่ root ของโปรเจ็กต์:

```env
# App
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_MOCK_MODE=false

# LINE OA
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=

# Facebook Messenger
FACEBOOK_PAGE_ID=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_PAGE_ACCESS_TOKEN=
FACEBOOK_VERIFY_TOKEN=

# Instagram
INSTAGRAM_ACCOUNT_ID=
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_ACCESS_TOKEN=

# TikTok
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_ACCESS_TOKEN=
```

---

## 8. Troubleshooting

### Webhook ไม่ทำงาน

1. ตรวจสอบว่า URL เข้าถึงได้จากภายนอก (ใช้ ngrok สำหรับ development)
2. ตรวจสอบ SSL Certificate ถูกต้อง (ต้องเป็น HTTPS)
3. ตรวจสอบ Verify Token ตรงกัน (Facebook/Instagram)
4. ดู logs ของ server เพื่อตรวจสอบ errors

### LINE Webhook verify ไม่ผ่าน

- ตรวจสอบว่า endpoint ตอบ HTTP 200 สำหรับ GET request
- Channel Access Token ต้องเป็น Long-lived token

### Facebook ส่ง Webhook ไม่มา

- ตรวจสอบว่า App อยู่ใน Live mode (ไม่ใช่ Development)
- ตรวจสอบว่า Subscribe fields ถูกต้อง
- ตรวจสอบว่าได้ `pages_messaging` permission

### Instagram DM ไม่เข้า

- ตรวจสอบว่าเป็น Business/Creator Account
- ตรวจสอบว่าเชื่อมกับ Facebook Page แล้ว
- ตรวจสอบ `instagram_manage_messages` permission

### ใช้ ngrok สำหรับ Local Development

```bash
# ติดตั้ง ngrok
npm install -g ngrok

# รัน tunnel
ngrok http 3000

# คัดลอก HTTPS URL ที่ได้ไปใช้เป็น Webhook URL
# เช่น https://xxxx-xx-xx-xxx-xx.ngrok-free.app/api/webhook/line
```

---

## การตั้งค่าผ่านหน้าเว็บ

นอกจาก Environment Variables แล้ว คุณสามารถตั้งค่าผ่านหน้าเว็บได้ที่:

**เมนู → ตั้งค่าการเชื่อมต่อ** (`/settings`)

หน้านี้จะแสดง:
- สถานะการเชื่อมต่อของแต่ละแพลตฟอร์ม
- Webhook URL ที่ต้องใช้ (พร้อมปุ่มคัดลอก)
- ฟอร์มกรอก Credentials
- ขั้นตอนแบบย่อสำหรับแต่ละแพลตฟอร์ม

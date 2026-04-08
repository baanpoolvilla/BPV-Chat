# คู่มือการเชื่อมต่อ N8N กับ Baanpool Chatbot

## ภาพรวม

ระบบ Baanpool Chatbot (Next.js Frontend) ทำหน้าที่เป็น **Admin Dashboard** สำหรับดูและตอบแชท  
**N8N** ทำหน้าที่เป็น **Backend Automation** ที่รับ Webhook จากแพลตฟอร์มต่าง ๆ แล้วส่งต่อมายัง Dashboard

```
┌─────────────┐     Webhook      ┌──────────┐    API / WebSocket    ┌─────────────────┐
│  LINE OA    │ ───────────────► │          │ ◄────────────────────► │                 │
│  Facebook   │ ───────────────► │   N8N    │                       │  Baanpool Chat   │
│  Instagram  │ ───────────────► │  Server  │ ─────────────────────► │  Dashboard       │
│  TikTok     │ ───────────────► │          │    (Next.js Frontend) │                 │
└─────────────┘                  └──────────┘                       └─────────────────┘
                                      │
                                      │  AI Bot Logic
                                      │  (OpenAI / Custom)
                                      ▼
                                 ┌──────────┐
                                 │ Database │
                                 │ (MySQL/  │
                                 │ Postgres/│
                                 │ MongoDB) │
                                 └──────────┘
```

---

## วิธีเชื่อมต่อมี 2 แบบ

| แบบ | วิธี | เหมาะกับ |
|-----|------|----------|
| **แบบ A** | N8N เป็น Backend API ให้ Dashboard เรียก | ง่าย, เร็ว, เหมาะกับ MVP |
| **แบบ B** | N8N ส่งข้อมูลผ่าน Webhook + WebSocket | Real-time, เหมาะกับ Production |

---

## แบบ A: N8N เป็น Backend API (แนะนำเริ่มต้น)

### หลักการ
- N8N สร้าง Webhook nodes เพื่อรับ request จาก Dashboard  
- Dashboard เรียก N8N Webhook URL แทน Backend API  
- N8N จัดการ Database, AI Bot, ส่งข้อความกลับแพลตฟอร์ม

### ขั้นตอน

#### 1. สร้าง N8N Workflows สำหรับ API Endpoints

สร้าง Workflow ใน N8N ตามแต่ละ endpoint ที่ Dashboard ต้องการ:

##### Workflow 1: GET Conversations
```
[Webhook: GET /conversations] → [Database Query] → [Response]
```
- **Webhook Node**: Method = GET, Path = `/conversations`
- **Database Node**: Query conversations table พร้อม filters (status, search)
- **Respond to Webhook**: ส่ง JSON array ของ conversations

##### Workflow 2: GET Conversation by ID
```
[Webhook: GET /conversations/:id] → [Database Query] → [Response]
```

##### Workflow 3: Send Message
```
[Webhook: POST /messages] → [Save to DB] → [Send to Platform] → [Response]
```
- รับ `{ conversationId, content, type }` 
- บันทึกลง Database
- ส่งข้อความกลับไปยังแพลตฟอร์มต้นทาง (LINE, FB, IG)
- ตอบกลับ Dashboard ด้วย Message object

##### Workflow 4: Toggle Bot/Human Mode
```
[Webhook: POST /conversations/:id/toggle-mode] → [Update DB] → [Response]
```

##### Workflow 5: Dashboard Stats
```
[Webhook: GET /dashboard/stats] → [Aggregate Query] → [Response]
```

#### 2. ตั้งค่า Dashboard ให้ชี้ไป N8N

แก้ไฟล์ `.env.local`:

```env
# ชี้ไปที่ N8N Webhook URL
NEXT_PUBLIC_API_URL=https://your-n8n-domain.com/webhook

# ปิด Mock Mode เพื่อใช้ API จริง
NEXT_PUBLIC_MOCK_MODE=false
```

> **สำคัญ**: N8N Webhook URL ต้องตรงกับ path ที่ Dashboard เรียก  
> เช่น Dashboard เรียก `GET /conversations` → N8N Webhook path = `/conversations`

#### 3. ตั้งค่า N8N รับ Webhook จากแพลตฟอร์ม

##### LINE OA → N8N
```
[Webhook: POST /webhook/line] → [Parse LINE Event] → [Save to DB] → [AI Bot Response] → [LINE Reply API]
```

1. สร้าง Webhook Node ใน N8N: `POST /webhook/line`
2. คัดลอก URL ไปวางใน LINE Developers Console → Webhook URL
3. ใช้ **HTTP Request Node** เรียก LINE Reply API เพื่อตอบกลับ

##### Facebook Messenger → N8N
```
[Webhook: POST /webhook/facebook] → [Parse FB Event] → [Save to DB] → [AI Bot Response] → [FB Send API]
```

##### Instagram → N8N
```
[Webhook: POST /webhook/instagram] → [Parse IG Event] → [Save to DB] → [AI Bot Response] → [IG Send API]
```

#### 4. N8N Workflow สำหรับรับข้อความจาก LINE (ตัวอย่างเต็ม)

```json
{
  "nodes": [
    {
      "name": "LINE Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "webhook/line",
        "responseMode": "responseNode"
      }
    },
    {
      "name": "Parse Events",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const body = $input.first().json.body;\nconst events = body.events || [];\nreturn events.map(e => ({json: e}));"
      }
    },
    {
      "name": "Filter Messages",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [{ "value1": "={{$json.type}}", "value2": "message" }]
        }
      }
    },
    {
      "name": "Save to Database",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "messages",
        "columns": "conversation_id, content, sender_type, channel, timestamp"
      }
    },
    {
      "name": "AI Bot Reply",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "operation": "message",
        "model": "gpt-4",
        "messages": "You are a helpful assistant for Baanpool villa booking..."
      }
    },
    {
      "name": "LINE Reply",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://api.line.me/v2/bot/message/reply",
        "headers": { "Authorization": "Bearer {{$env.LINE_CHANNEL_ACCESS_TOKEN}}" },
        "body": {
          "replyToken": "={{$json.replyToken}}",
          "messages": [{ "type": "text", "text": "={{$node['AI Bot Reply'].json.content}}" }]
        }
      }
    },
    {
      "name": "Respond OK",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": { "respondWith": "json", "responseBody": "{\"status\": \"ok\"}" }
    }
  ]
}
```

---

## แบบ B: N8N + WebSocket (Real-time)

### หลักการ
- N8N รับ Webhook จากแพลตฟอร์ม
- N8N ส่ง event ไปยัง WebSocket server เพื่อ push ข้อความ real-time ไปยัง Dashboard
- Dashboard แสดงข้อความใหม่ทันทีไม่ต้อง refresh

### ขั้นตอนเพิ่มเติม

#### 1. ตั้ง WebSocket Server (Node.js)

สร้าง WebSocket server แยก (หรือใส่ใน Express backend):

```javascript
// server.js
const { Server } = require('socket.io');
const io = new Server(3001, {
  cors: { origin: 'http://localhost:3000' }
});

io.on('connection', (socket) => {
  console.log('Dashboard connected');
  
  // Admin ส่งข้อความ
  socket.on('message:send', async (data) => {
    // บันทึกลง DB
    // ส่งไปยังแพลตฟอร์มต้นทาง
    // Broadcast กลับไปยัง Dashboard
    io.emit('message:new', {
      conversationId: data.conversationId,
      message: data.message
    });
  });
});

module.exports = { io };
```

#### 2. N8N ส่ง Event ไป WebSocket

ใน N8N Workflow หลังจาก save ข้อความลง DB:

```
[Save to DB] → [HTTP Request to WebSocket API]
```

```json
{
  "name": "Notify Dashboard",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "http://localhost:3001/api/notify",
    "body": {
      "event": "message:new",
      "data": {
        "conversationId": "={{$json.conversationId}}",
        "message": {
          "id": "={{$json.messageId}}",
          "content": "={{$json.content}}",
          "type": "user",
          "sender": {
            "id": "={{$json.userId}}",
            "name": "={{$json.userName}}",
            "type": "user"
          },
          "timestamp": "={{$now.toISO()}}"
        }
      }
    }
  }
}
```

#### 3. ตั้งค่า Dashboard

```env
NEXT_PUBLIC_API_URL=https://your-n8n-domain.com/webhook
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_MOCK_MODE=false
```

---

## API Endpoints ที่ N8N ต้องสร้าง

Dashboard จะเรียก endpoints เหล่านี้ ซึ่ง N8N ต้องมี Webhook รองรับ:

| Method | Path | คำอธิบาย | Request Body |
|--------|------|----------|--------------|
| `POST` | `/auth/login` | ล็อกอิน | `{ email, password }` |
| `GET` | `/auth/me` | ดึงข้อมูล user ปัจจุบัน | - |
| `GET` | `/conversations` | ดึงรายการแชททั้งหมด | Query: `status`, `search` |
| `GET` | `/conversations/:id` | ดึงแชทตาม ID | - |
| `PATCH` | `/conversations/:id/status` | เปลี่ยนสถานะ | `{ status }` |
| `PATCH` | `/conversations/:id/read` | อ่านแล้ว | - |
| `GET` | `/conversations/stats` | สถิติแชท | - |
| `GET` | `/messages/conversation/:id` | ดึงข้อความในแชท | - |
| `POST` | `/messages` | ส่งข้อความ | `{ conversationId, content, type }` |
| `POST` | `/conversations/:id/toggle-mode` | สลับ bot/human | `{ mode }` |
| `GET` | `/dashboard/stats` | สถิติ dashboard | - |
| `GET` | `/dashboard/recent` | แชทล่าสุด | Query: `limit` |

### Response Format ที่ Dashboard คาดหวัง

#### Conversation Object
```json
{
  "id": "conv1",
  "customerId": "user1",
  "customerName": "คุณสมศรี",
  "customerEmail": "somsri@gmail.com",
  "customerPhone": "081-234-5678",
  "customerAvatar": null,
  "channel": "line",
  "status": "bot",
  "lastMessage": "สวัสดีค่ะ",
  "lastMessageTime": "2026-02-19T08:00:00.000Z",
  "unreadCount": 2,
  "messages": [],
  "labels": [{ "id": "l1", "name": "VIP", "color": "#f36734" }],
  "createdAt": "2026-02-19T07:00:00.000Z",
  "updatedAt": "2026-02-19T08:00:00.000Z",
  "summary": "สอบถามเรื่องจอง"
}
```

#### Message Object
```json
{
  "id": "msg1",
  "conversationId": "conv1",
  "type": "user",
  "content": "สวัสดีค่ะ",
  "contentType": "text",
  "sender": {
    "id": "user1",
    "name": "คุณสมศรี",
    "type": "user"
  },
  "timestamp": "2026-02-19T08:00:00.000Z",
  "isRead": false
}
```

#### Stats Object
```json
{
  "totalConversations": 128,
  "botHandled": 85,
  "humanRequired": 28,
  "resolved": 15,
  "channelStats": { "line": 72, "facebook": 35, "instagram": 15, "tiktok": 6 },
  "todayMessages": 342,
  "responseRate": 94.5
}
```

---

## N8N Workflow Templates

### Template: LINE → Bot → Dashboard

```
Trigger: LINE Webhook
    ↓
Code: Parse LINE event format
    ↓
IF: event.type === "message"
    ├── Yes → Database: Find or create conversation
    │         ↓
    │         Database: Save message
    │         ↓
    │         IF: conversation.status === "bot"
    │         ├── Yes → OpenAI: Generate reply
    │         │         ↓
    │         │         HTTP: LINE Reply API
    │         │         ↓
    │         │         Database: Save bot reply
    │         └── No → (Admin จะตอบเองผ่าน Dashboard)
    │         ↓
    │         HTTP: Notify Dashboard (WebSocket/API)
    └── No → Respond: 200 OK
```

### Template: Dashboard → ส่งข้อความ → แพลตฟอร์ม

```
Trigger: Webhook POST /messages
    ↓
Database: Get conversation (หา channel + customer info)
    ↓
Switch: conversation.channel
    ├── "line" → HTTP: LINE Push Message API
    ├── "facebook" → HTTP: Facebook Send API
    ├── "instagram" → HTTP: Instagram Send API
    └── "tiktok" → HTTP: TikTok Message API
    ↓
Database: Save admin message
    ↓
Respond: Message object
```

---

## การตั้งค่า CORS ใน N8N

ถ้า Dashboard (localhost:3000) เรียก N8N (localhost:5678) ต้องตั้ง CORS:

ใน N8N environment variables:
```env
N8N_ENDPOINT_WEBHOOK=webhook
N8N_WEBHOOK_URL=https://your-n8n-domain.com/webhook/

# อนุญาต CORS
WEBHOOK_URL=https://your-n8n-domain.com/webhook/
```

หรือใช้ **Reverse Proxy** (nginx) เพื่อ serve ทั้ง Dashboard และ N8N ภายใต้ domain เดียว:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    # Dashboard
    location / {
        proxy_pass http://localhost:3000;
    }

    # N8N API
    location /api/ {
        proxy_pass http://localhost:5678/webhook/;
        proxy_set_header Host $host;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## Quick Start (เริ่มต้นเร็ว)

### 1. ตั้งค่า N8N

```bash
# ติดตั้ง N8N
npm install -g n8n

# รัน N8N
n8n start
# เปิด http://localhost:5678
```

### 2. Import Workflows

1. เปิด N8N → กด **+** สร้าง Workflow ใหม่
2. สร้าง Webhook nodes ตาม API endpoints ด้านบน
3. เชื่อมต่อกับ Database (MySQL/Postgres/MongoDB)
4. ทดสอบแต่ละ endpoint

### 3. ตั้งค่า Dashboard

```bash
cd Chat-Bot

# สร้าง .env.local
cp .env.example .env.local

# แก้ไข
NEXT_PUBLIC_API_URL=http://localhost:5678/webhook
NEXT_PUBLIC_MOCK_MODE=false

# รัน
npm run dev
```

### 4. ทดสอบ

1. เปิด Dashboard → ล็อกอิน
2. ส่งข้อความผ่าน LINE/Facebook
3. ตรวจสอบว่าข้อความปรากฏใน Dashboard
4. ตอบกลับจาก Dashboard → ตรวจสอบว่าลูกค้าได้รับข้อความ

---

## Tips

- **Development**: ใช้ `ngrok` เพื่อให้แพลตฟอร์มส่ง webhook มาหา N8N ได้
- **Database**: แนะนำใช้ PostgreSQL เพราะ N8N มี node รองรับดี
- **AI Bot**: ใช้ OpenAI node ใน N8N ได้เลย หรือเรียก API ภายนอก
- **Error Handling**: ใส่ Error Trigger node ใน N8N เพื่อจัดการ errors
- **Rate Limiting**: LINE มี limit 500 push messages/เดือน (Free plan), Facebook ไม่จำกัดใน Standard mode

# AI Chatbot Admin Panel

## Features Implemented ✅

### Authentication
- ✅ Login page with mock credentials
- ✅ Protected routes with auth checking
- ✅ Role-based UI (Admin/Staff)
- ✅ Session persistence with localStorage

### Dashboard
- ✅ Stats cards (Total Conversations, Bot-handled, Human-required, Resolved)
- ✅ Recent conversations table
- ✅ Status badges with color coding

### Conversations
- ✅ Left panel: Conversation list with search
- ✅ Filter tabs (All, Bot, Human, Resolved)
- ✅ Unread indicators
- ✅ Right panel: Chat window
- ✅ Message bubbles (user/bot/admin)
- ✅ Message timestamps
- ✅ Scrollable history
- ✅ Input box with send button
- ✅ Take Over button (switch to human)
- ✅ Return to Bot button
- ✅ Mark as Resolved button
- ✅ Confirmation dialog for mode switching

### State Management
- ✅ Zustand store with all required states
- ✅ conversations store
- ✅ selectedConversation
- ✅ adminMode toggle
- ✅ Loading states

### API Layer
- ✅ Mock data service
- ✅ getConversations()
- ✅ getMessages()
- ✅ sendMessage()
- ✅ updateStatus()
- ✅ toggleMode()
- ✅ getStats()
- ✅ All with placeholder endpoints

### Real-time Structure
- ✅ Socket.io client setup (placeholder)
- ✅ Subscription structure ready
- ✅ Auto-scroll on new message

### UI/UX
- ✅ Clean SaaS-style layout
- ✅ Sidebar navigation
- ✅ Top header with user info
- ✅ Dark mode support ready
- ✅ Mobile responsive
- ✅ Smooth transitions
- ✅ Loading skeletons

### Design
- ✅ Professional minimal design
- ✅ Soft shadows
- ✅ Rounded 2xl cards
- ✅ Subtle animations
- ✅ Status color coding (Blue=Bot, Orange=Human, Green=Resolved)

## Project Structure

```
src/
├── app/
│   ├── login/page.tsx
│   ├── dashboard/page.tsx
│   ├── conversations/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── providers.tsx
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── ChatBubble.tsx
│   │   └── ConversationList.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── ProtectedLayout.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Dialog.tsx
│       ├── Input.tsx
│       └── Toast.tsx
├── lib/
│   ├── api.ts
│   ├── socket.ts
│   └── mockData.ts
├── store/
│   └── useChatStore.ts
├── types/
│   └── index.ts
└── utils/
    └── cn.ts
```

## Technologies Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS 4** - Utility-first CSS
- **Zustand** - State management
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Lucide React** - Icon library
- **Date-fns** - Date formatting

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo Credentials:**
- Email: admin@example.com
- Password: password

## Build & Deploy

```bash
npm run build
npm start
```

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_MOCK_MODE=true
```

## Notes

- Mock mode enabled by default for development
- All data is generated from mock data service
- Socket.io is set up but placeholder (ready for backend integration)
- Production-ready code structure
- Ready for GitHub push

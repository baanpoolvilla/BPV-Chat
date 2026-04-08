# Admin Panel - LINE AI Chatbot - Deployment Guide

## ✅ Project Complete

A production-ready admin dashboard for managing LINE AI Chatbot conversations for villa booking business.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# Open http://localhost:3000

# Build for production
npm run build
npm start
```

## 🔑 Demo Credentials

```
Email: admin@example.com
Password: password
```

## 📦 What's Included

### Pages
1. **Login** - Authentication with mock credentials
2. **Dashboard** - Statistics and recent conversations overview
3. **Conversations** - Full chat management interface
4. **Protected Routes** - Role-based access control

### Features
- Real-time conversation management
- Bot/Human mode switching with confirmation
- Conversation status tracking (Bot/Human/Resolved)
- Search and filtering
- Responsive mobile design
- Dark mode support ready

### Components
- Custom shadcn/ui-style components
- Reusable Button, Card, Dialog, Input, Badge, Toast
- Chat-specific: ChatWindow, ChatBubble, ConversationList
- Layout: Sidebar, Header, ProtectedLayout

### State Management
- Zustand store with complete state handling
- Mock API service with axios
- Socket.io client setup

### Styling
- TailwindCSS 4 with custom theme
- Mobile-first responsive design
- Smooth animations and transitions

## 📁 File Structure

```
Chat-Bot/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components
│   ├── lib/                    # Utilities (API, Socket, Mock data)
│   ├── store/                  # Zustand store
│   ├── types/                  # TypeScript definitions
│   └── utils/                  # Helper functions
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── .env.example                # Environment template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # TailwindCSS config
├── next.config.js              # Next.js config
├── README.md                   # User guide
├── FEATURES.md                 # Feature checklist
└── DEPLOYMENT.md               # This file
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_MOCK_MODE=true
```

**Available Options:**
- `NEXT_PUBLIC_MOCK_MODE=true` - Use mock data (default)
- `NEXT_PUBLIC_MOCK_MODE=false` - Use real API endpoints
- `NEXT_PUBLIC_API_URL` - API base URL
- `NEXT_PUBLIC_SOCKET_URL` - WebSocket server URL

## 🚀 Deployment Options

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Docker
```bash
docker build -t chatbot-admin .
docker run -p 3000:3000 chatbot-admin
```

### Self-Hosted
```bash
npm run build
npm start
```

Server runs on port 3000 by default.

## 🔌 API Integration

When ready to integrate with backend:

1. Set `NEXT_PUBLIC_MOCK_MODE=false` in `.env.local`
2. Update `NEXT_PUBLIC_API_URL` to your backend URL
3. Backend should implement these endpoints:

```
POST   /auth/login
GET    /auth/me
GET    /conversations
GET    /conversations/:id
PATCH  /conversations/:id/status
PATCH  /conversations/:id/read
POST   /messages
POST   /conversations/:id/toggle-mode
GET    /dashboard/stats
```

## 🔄 Socket.io Integration

For real-time updates, set up Socket.io server and configure:

1. Update `NEXT_PUBLIC_SOCKET_URL` in `.env.local`
2. Subscribe to events in components using `subscribeToConversation()`
3. Server should emit:
   - `message:new` - New message in conversation
   - `conversation:status-change` - Status change
   - `notification:unread` - Unread count update

## 📊 Type Definitions

All TypeScript types in `src/types/index.ts`:
- User, Message, Conversation
- ConversationStatus, MessageType, UserRole
- Stats, AuthContextType, ToastMessage

Extend these types as needed for your backend.

## 🎨 Customization

### Theme Colors
Edit `src/app/globals.css` theme variables:
```css
@theme {
  --color-primary: #000000;
  --color-secondary: #f5f5f5;
  /* ... */
}
```

### Mock Data
Edit `src/lib/mockData.ts` to update default conversations and messages.

### Components
All UI components in `src/components/ui/` are customizable:
- Button, Card, Dialog, Input, Badge, Toast

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🔐 Authentication Flow

1. User enters credentials on login page
2. Mock auth validates (demo: any email/password works)
3. Token stored in localStorage
4. Redirects to dashboard
5. Protected routes check auth on load
6. Logout clears token and redirects to login

## 🛠️ Development

### Adding New Features

1. **New API endpoint**: Add to `src/lib/api.ts`
2. **New store state**: Update `src/store/useChatStore.ts`
3. **New component**: Create in `src/components/`
4. **New page**: Create in `src/app/`

### Code Quality

- TypeScript strict mode enabled
- ESLint configured
- All imports use absolute paths (`@/*`)
- Components use React functional patterns
- Zustand for state (no Context API)

## 📱 Mobile Responsive

Breakpoints:
- `sm`: 640px
- `md`: 768px (sidebar appear)
- `lg`: 1024px
- `xl`: 1280px

Mobile layout:
- Bottom navigation bar
- Single-column chat
- Collapsible conversation list

## ✨ Performance

- Static page generation where possible
- Optimized images with Next.js Image component
- Code splitting per route
- TailwindCSS purging unused styles
- Minimal bundle size

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Build errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

### TypeScript errors
```bash
npm run lint
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [React Documentation](https://react.dev)

## 🔄 Version Info

- Next.js: 16.1.6
- React: 19.2.4
- TypeScript: 5.9.3
- TailwindCSS: 4.1.18
- Zustand: 5.0.11

## 📄 License

MIT License

## 🤝 Support

For issues or questions:
1. Check existing documentation
2. Review FEATURES.md for completed features
3. Check .env.example for configuration
4. Verify mock data in src/lib/mockData.ts

---

**Ready for production deployment! 🚀**

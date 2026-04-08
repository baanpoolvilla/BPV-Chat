# Admin Panel - LINE AI Chatbot Management

A production-ready admin dashboard for managing LINE AI Chatbot conversations for a villa booking business.

## 🎯 Features

- **Authentication**: Mock login system with role-based access (Admin/Staff)
- **Dashboard**: Real-time statistics and recent conversations overview
- **Conversations Management**: 
  - Conversation list with search and filtering
  - Real-time chat interface
  - Bot/Human mode toggling
  - Conversation status management
- **Responsive Design**: Mobile-first approach with full desktop support
- **Real-time Updates**: Socket.io placeholder for future integration
- **State Management**: Zustand for efficient state handling
- **Type-Safe**: Full TypeScript support
- **Modern UI**: TailwindCSS + shadcn/ui components

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

- **Email**: admin@example.com
- **Password**: password

## 📁 Project Structure

```
src/
├── app/
│   ├── login/              # Authentication pages
│   ├── dashboard/          # Dashboard page
│   ├── conversations/      # Conversations management
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home redirect
│   ├── globals.css         # Global styles
│   └── providers.tsx       # Client providers
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx     # Main chat interface
│   │   ├── ChatBubble.tsx     # Message bubble component
│   │   └── ConversationList.tsx # Conversations list
│   ├── layout/
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   ├── Header.tsx         # Page header
│   │   └── ProtectedLayout.tsx # Auth wrapper
│   └── ui/                     # shadcn-style components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Dialog.tsx
│       ├── Input.tsx
│       └── Toast.tsx
├── lib/
│   ├── api.ts             # API service layer (mock + real)
│   ├── socket.ts          # Socket.io client
│   └── mockData.ts        # Mock data generation
├── store/
│   └── useChatStore.ts    # Zustand store
├── types/
│   └── index.ts           # TypeScript definitions
└── utils/
    └── cn.ts              # Tailwind CSS utilities
```

## 🔧 Configuration

### Mock Mode
Mock mode is enabled by default for development. To use real APIs:

```env
NEXT_PUBLIC_MOCK_MODE=false
NEXT_PUBLIC_API_URL=http://your-api-url/api
```

### API Endpoints (When Real Mode)

- `POST /auth/login` - User authentication
- `GET /auth/me` - Current user info
- `GET /conversations` - Get conversations list
- `GET /conversations/:id` - Get conversation detail
- `PATCH /conversations/:id/status` - Update status
- `PATCH /conversations/:id/read` - Mark as read
- `POST /messages` - Send message
- `POST /conversations/:id/toggle-mode` - Toggle bot/human mode
- `GET /dashboard/stats` - Dashboard statistics

## 🎨 UI Components

### shadcn/ui Style Components
- Button
- Card (with variants: Header, Content, Footer)
- Badge (with status variants)
- Dialog
- Input
- Toast notifications

### Custom Components
- **ChatWindow**: Main chat interface with message input
- **ChatBubble**: Individual message display
- **ConversationList**: Filterable conversation sidebar
- **Sidebar**: Navigation and logout
- **Header**: Page title and user info

## 🔐 Authentication

### Login Flow
1. Enter email and password
2. Mock verification (demo mode)
3. Store token in localStorage
4. Redirect to dashboard

### Protected Routes
- `/dashboard`
- `/conversations`

Unauthenticated users are redirected to `/login`

## 💾 State Management

Zustand store includes:
- **Auth State**: User, token, auth status
- **Conversations**: List, selected, filtering, search
- **Messages**: Sending, history
- **Stats**: Dashboard statistics
- **UI**: Dialog state, loading states

## 🔄 Real-time Features (Placeholder)

Socket.io integration ready for:
- New message notifications
- Conversation status updates
- User presence
- Typing indicators

Configure in `.env.local`:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## 📱 Responsive Design

- **Mobile**: Bottom navigation, single-column layout
- **Tablet**: Responsive grid, collapsible sidebar
- **Desktop**: Full sidebar, two-column chat layout

## 🎨 Dark Mode Ready

CSS variables support light/dark themes. Enable in root element:
```html
<html class="dark">
```

## 🛠️ Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📦 Dependencies

### Core
- `next@14` - React framework
- `react@19` - UI library
- `typescript` - Type safety

### Styling
- `tailwindcss@4` - Utility-first CSS
- `lucide-react` - Icon library

### State & API
- `zustand` - State management
- `axios` - HTTP client
- `socket.io-client` - Real-time communication

### Utilities
- `date-fns` - Date formatting
- `clsx` - Class name merge
- `class-variance-authority` - Component variants

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Notes

- All data is currently mocked for demonstration
- Replace mock data with real API calls by updating `api.ts`
- Socket.io integration is placeholder - needs backend implementation
- Production deployment should use environment variables for sensitive data

## 🔜 Future Enhancements

- [ ] Database integration
- [ ] Real Socket.io implementation
- [ ] User management
- [ ] Conversation analytics
- [ ] Message search
- [ ] File upload support
- [ ] Custom themes
- [ ] Multi-language support

## 📄 License

MIT License - Feel free to use this project as a template.

## 💬 Support

For issues or questions, please open an GitHub issue or contact the development team.

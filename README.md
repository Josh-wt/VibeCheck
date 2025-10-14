# VibeCheck 🎯

AI-powered social discovery platform that helps students find their perfect friend matches, study partners, and weekend activity buddies through intelligent personality-based matching.

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)](https://lovable.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev/)

## 🌟 Features

### AI-Powered Friend Matching
- **Smart Personality Quiz**: Comprehensive assessment analyzing social preferences, interests, and compatibility factors
- **AI Social Groups**: Advanced AI categorizes students into compatible social groups based on quiz responses
- **Real-Time Matching**: Discover students in your social group who share your school and vibe

### Multi-Category Discovery
- **Study Partners**: Find academically compatible peers who match your learning style and subjects
- **Weekend Activities**: Connect with students who share your weekend interests and energy levels
- **Activity Buddies**: Discover peers for specific activities like sports, arts, gaming, or outdoor adventures

### Connection System
- **Smart Connections**: Send and manage connection requests with other students
- **Real-Time Messaging**: Chat with your connections through an integrated messaging system
- **Connection Management**: Track pending requests, accepted connections, and message history

### Intelligent Matching Algorithm
- Personality-based compatibility scoring
- Shared interest detection
- Complementary trait pairing (e.g., introverts with extroverts)
- School and location-based filtering

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn-ui components
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth
- **AI Integration**: Lovable AI (Gemini & GPT models)
- **Real-time**: Supabase Realtime subscriptions
- **Routing**: React Router v6

## 📋 Prerequisites

- Node.js 18+ (recommended: install via [nvm](https://github.com/nvm-sh/nvm))
- npm or bun package manager
- Git

## 🛠️ Installation & Setup

### Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd vibecheck
```

### Install Dependencies

```bash
npm install
# or
bun install
```

### Environment Variables

The project uses Lovable Cloud, which automatically configures the following environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

These are auto-generated and should not be modified manually.

### Run Development Server

```bash
npm run dev
# or
bun dev
```

Visit `http://localhost:5173` to see your app.

## 📁 Project Structure

```
vibecheck/
├── src/
│   ├── components/           # React components
│   │   ├── Activities/       # Activity discovery components
│   │   ├── Discovery/        # Friend matching components
│   │   ├── Landing/          # Landing page sections
│   │   ├── StudyHelp/        # Study partner components
│   │   ├── WeekendPlans/     # Weekend activity components
│   │   ├── common/           # Shared components
│   │   └── ui/               # shadcn-ui components
│   ├── contexts/             # React contexts (Auth, etc.)
│   ├── hooks/                # Custom React hooks
│   ├── integrations/         # Supabase client & types
│   ├── lib/                  # Utility functions
│   ├── pages/                # Route pages
│   │   ├── Auth.tsx          # Authentication page
│   │   ├── Discovery.tsx     # Friend discovery page
│   │   ├── StudyHelp.tsx     # Study partners page
│   │   ├── Activities.tsx    # Activities page
│   │   └── WeekendPlans.tsx  # Weekend plans page
│   ├── App.tsx               # Main app component
│   ├── index.css             # Global styles & design tokens
│   └── main.tsx              # App entry point
├── supabase/
│   ├── functions/            # Edge functions
│   └── migrations/           # Database migrations
└── public/                   # Static assets
```

## 🎯 How It Works

### 1. **Onboarding Flow**
Users complete category-specific quizzes:
- **Friends Quiz**: Personality, social preferences, and interests
- **Study Partner Assessment**: Academic needs and learning styles
- **Weekend Interests**: Activity preferences and energy levels
- **Activity Profile**: Specific hobby and interest selection

### 2. **AI Analysis**
The platform uses AI to:
- Analyze quiz responses and personality traits
- Categorize users into compatible social groups
- Calculate compatibility scores between potential matches
- Generate personalized recommendations

### 3. **Matching & Discovery**
- View AI-curated matches in each category
- See compatibility reasons and shared interests
- Browse detailed profiles of potential buddies
- Filter by school, interests, and availability

### 4. **Connection & Communication**
- Send connection requests to matches
- Chat with accepted connections via real-time messaging
- Manage your network of friends, study partners, and activity buddies

## 🔐 Security

- **Row Level Security (RLS)**: All database tables enforce user-level permissions
- **Secure Authentication**: Email/password authentication via Supabase Auth
- **Data Privacy**: Users can only view and interact with authorized data
- **Protected Routes**: Authentication required for all main features

## 🚀 Deployment

### Deploy with Lovable

1. Open your [Lovable Project](https://lovable.dev/projects/00b785a2-80ca-483b-b415-4f9be0216b79)
2. Click **Share → Publish**
3. Your app will be deployed to `https://<your-app>.lovable.app`

### Custom Domain

Navigate to **Project > Settings > Domains** in Lovable to connect your custom domain.

*(Requires a paid Lovable plan)*

## 🤝 Contributing

This project is built with [Lovable](https://lovable.dev), which provides an AI-powered development experience.

### Development Workflow

1. **Via Lovable**: Make changes by chatting with AI in the [Lovable editor](https://lovable.dev/projects/00b785a2-80ca-483b-b415-4f9be0216b79)
2. **Via GitHub**: Clone repo, make changes locally, and push to sync with Lovable
3. **Via GitHub Codespaces**: Develop directly in the browser

### Making Changes

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
git add .
git commit -m "Add your feature"

# Push changes
git push origin feature/your-feature-name
```

Changes pushed to GitHub automatically sync to Lovable.

## 📖 Documentation

- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn-ui](https://ui.shadcn.com/)

## 🐛 Known Issues & Roadmap

### Current Limitations
- Message notifications are in-app only (no email/push notifications yet)
- Group chat not yet implemented (1-on-1 only)
- Mobile app not available (web-only)

### Planned Features
- [ ] Push notifications for messages and connection requests
- [ ] Group conversations
- [ ] Event planning and coordination
- [ ] Advanced filtering and search
- [ ] User profiles with photo galleries
- [ ] Campus map integration
- [ ] Mobile native apps (iOS/Android)

## 📄 License

This project is built with Lovable and is subject to its terms of service.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev) - AI-powered full-stack development platform
- UI components from [shadcn-ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

For support and questions:
- [Lovable Discord Community](https://discord.com/channels/1119885301872070706/1280461670979993613)
- [Lovable Documentation](https://docs.lovable.dev/)

---

**Project URL**: https://lovable.dev/projects/00b785a2-80ca-483b-b415-4f9be0216b79

Built with ❤️ using Lovable

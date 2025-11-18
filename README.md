# SHIELD - Christian Apologetics Study App

🛡️ **SHIELD** is a comprehensive Christian apologetics application designed to help believers study and defend their faith through structured lessons, scriptural reasoning, and AI-assisted theological clarification.

## 🎨 Design System

### Brand Identity

- **Name**: SHIELD
- **Theme**: Academic + Bold (defense of truth)
- **Tone**: Scholarly, disciplined, modern Christian study

### Colors

```css
--color-navy: #0B132B        /* Primary */
--color-gold: #FFD700        /* Accent */
--color-off-white: #F9FAFB   /* Background Light */
--color-dark: #111827        /* Background Dark */
--color-emerald: #10B981     /* Theme Option */
--color-crimson: #B91C1C     /* Theme Option */
```

### Typography

- **Headers**: Playfair Display (serif)
- **Body/UI**: Inter (sans-serif)

### Spacing

8px grid system (`--space-1` through `--space-8`)

### Animation

- Transition timing: 150-250ms
- Keyframes: fadeIn, slideUp, slideDown, slideInLeft, slideInRight, scaleIn

## 🏗️ Architecture

### Tech Stack

- **Framework**: React with Next.js App Router ready
- **Styling**: CSS Modules (NO Tailwind)
- **Animation**: Motion (Framer Motion)
- **Backend**: Firebase ready (mock data included)
- **AI**: OpenAI API ready (mock responses included)

### Project Structure

```
/
├── App.tsx                          # Main application
├── styles/
│   └── globals.css                  # Global styles, CSS variables, animations
├── components/
│   ├── common/
│   │   ├── Button.tsx              # Reusable button component
│   │   ├── Button.module.css
│   │   ├── Card.tsx                # Reusable card component
│   │   └── Card.module.css
│   ├── layout/
│   │   ├── Navigation.tsx          # Mobile bottom nav + desktop sidebar
│   │   └── Navigation.module.css
│   ├── onboarding/
│   │   ├── Onboarding.tsx          # 3-slide onboarding flow
│   │   └── Onboarding.module.css
│   ├── auth/
│   │   ├── Auth.tsx                # Login/signup with email & Google
│   │   └── Auth.module.css
│   ├── dashboard/
│   │   ├── Dashboard.tsx           # Home screen with progress
│   │   └── Dashboard.module.css
│   ├── lessons/
│   │   ├── LessonsList.tsx         # Lessons browser with filters
│   │   ├── LessonsList.module.css
│   │   ├── LessonDetail.tsx        # Individual lesson view
│   │   └── LessonDetail.module.css
│   ├── ask-shield/
│   │   ├── AskShield.tsx           # AI assistant overlay
│   │   └── AskShield.module.css
│   ├── profile/
│   │   ├── Profile.tsx             # Profile, notes, settings tabs
│   │   └── Profile.module.css
│   └── context-builder/
│       ├── ContextBuilder.tsx      # RGS diagram visualizer
│       └── ContextBuilder.module.css
```

## 🧭 Navigation & Routes

### Mobile Navigation (Bottom Tab Bar)

- Home
- Lessons
- Ask Shield
- Notes
- Profile

### Desktop Navigation (Sidebar)

Same routes with expanded labels and icons

### Routes

1. **Home/Dashboard** - Progress summary, Defense of the Day, Quick Actions
2. **Lessons** - Filterable lesson list by category
3. **Lesson Detail** - Full lesson with Scripture, objections, responses
4. **Ask Shield** - AI assistant chat overlay
5. **Notes/Profile/Settings** - User content and preferences
6. **Context Builder** - Visual RGS diagram

## 🎯 Key Features

### 1. Onboarding (3 Slides)

- Slide 1: "Defend Your Faith with Confidence"
- Slide 2: "Study Scripture through Reasoned Context"
- Slide 3: "Learn from Theologians like Augustine"
- CTA: "Enter the Shield"

### 2. Authentication

- Email/Password
- Google Sign-In (mock)
- Guest Mode
- Shield branding with logo

### 3. Dashboard

- Personalized greeting
- Current lesson progress bar
- Defense of the Day (quote card)
- Suggested next lesson (if >90% complete)
- Quick action buttons
- 7-day streak indicator

### 4. Lessons System

**Categories:**

- Law & Grace
- Israel & the Church
- Salvation
- Trinity
- Scripture & Authority

**Lesson Structure:**

- Claim (theological statement)
- Counter-Argument (common objection)
- Scriptural Response (with verse highlights)
- Theologian Insights (historical quotes)

**Features:**

- Search functionality
- Category filtering
- Progress tracking
- Difficulty indicators
- Time estimates

### 5. Ask Shield (AI Assistant)

- Overlay chat interface
- Shield avatar with personality
- Calm, explanatory theological responses
- Scripture references
- "Add to Notes" functionality
- "View Related Lesson" suggestions
- Typing animation
- Suggested starter questions

### 6. Profile & Settings

**Profile Tab:**

- User avatar
- Stats: Lessons completed, streak, notes count
- Continue Study button

**Notes Tab:**

- Date-sorted note cards
- Manual tags
- Search functionality

**Settings Tab:**

- Theme switcher: Light, Dark, Emerald, Crimson
- Font size controls
- App version info
- Logout

### 7. Context Builder (RGS Diagram)

- Visual node-based graph
- Node types: Scripture, Claim, Theologian, Counterclaim
- Color-coded connections
- Hover tooltips
- Click to view details
- Academic minimalist style

## 🔌 Integration Points

### Firebase (Ready to Connect)

```typescript
// Firestore structure example:
lessons: {
  lessonId: {
    title: string,
    category: string,
    claim: string,
    counterArgument: string,
    scripturalResponse: {...},
    theologianInsights: [...]
  }
}

users: {
  userId: {
    name: string,
    email: string,
    progress: {...},
    notes: [...]
  }
}
```

### OpenAI API (Ready to Connect)

```typescript
// Example integration:
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: "You are Shield, a calm theological assistant...",
    },
    {
      role: "user",
      content: userQuestion,
    },
  ],
});
```

## 🎨 CSS Modules Usage

All styling uses CSS Modules for scoped styles. Example:

```tsx
import styles from "./Component.module.css";

<div className={styles.container}>
  <button className={`${styles.btn} ${styles.primary}`}>Click me</button>
</div>;
```

### Utility Classes Available

- `.fadeIn` - Fade in animation
- `.slideUp` - Slide up animation
- `.slideDown` - Slide down animation
- `.slideInLeft` - Slide from left
- `.slideInRight` - Slide from right
- `.scaleIn` - Scale in animation

## 🚀 Getting Started

1. Install dependencies:

```bash
npm install motion lucide-react
```

2. Run the development server:

```bash
npm run dev
```

3. Connect to Firebase (optional):

   - Create a Firebase project
   - Add credentials to environment variables
   - Update mock data calls to Firebase SDK

4. Connect to OpenAI (optional):
   - Add OpenAI API key to environment variables
   - Replace mock responses in AskShield component

## 🎭 Theme System

Themes are applied via `data-theme` attribute on the root element:

```typescript
document.documentElement.setAttribute("data-theme", "dark");
```

Available themes:

- `light` (default)
- `dark`
- `emerald`
- `crimson`

## 📱 Responsive Design

- **Mobile**: Bottom tab navigation, single column layouts
- **Desktop**: Side navigation (280px), multi-column grids
- **Breakpoint**: 768px

## 🛡️ Design Philosophy

SHIELD is designed to feel like a **digital study armory** - premium, intellectual, and quietly powerful. The interface prioritizes:

1. **Clarity**: Clean hierarchy, academic aesthetics
2. **Confidence**: Bold typography, structured layouts
3. **Depth**: Layered information, contextual insights
4. **Motion**: Smooth transitions, animation-ready structure

## 📄 License

This is a demonstration project for Christian apologetics education.

---

**Built with ❤️ for believers defending their faith**

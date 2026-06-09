# Frontend - RAG Proposal Generator

Angular 17 standalone application for the RAG Proposal Generator.

## Features

- 💬 Chat-based interface for proposal requests
- 🎨 Beautiful gradient UI with glassmorphism effects
- 📝 Real-time markdown rendering
- 📊 Slide deck format proposals
- 💾 Download proposals as markdown files
- 📱 Responsive design

## Quick Start

```bash
npm install
npm start
```

Application will be available at http://localhost:4200

## Project Structure

```
src/
├── app/
│   ├── components/           # (Future components)
│   ├── services/
│   │   └── api.service.ts    # Backend API communication
│   ├── models/
│   │   └── proposal.model.ts # TypeScript interfaces
│   ├── app.component.ts      # Main app component
│   ├── app.component.html    # Main template
│   ├── app.component.css     # Main styles
│   ├── app.config.ts         # App configuration
│   └── app.routes.ts         # Routing configuration
├── environments/
│   └── environment.ts        # Environment configuration
├── styles.css                # Global styles
├── index.html               # Entry HTML
└── main.ts                  # Bootstrap file
```

## Technologies

- **Angular 17** - Latest Angular with standalone components
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming
- **Marked** - Markdown parsing and rendering
- **Signals** - Angular's new reactivity primitive

## Key Features

### Standalone Components

This app uses Angular 17's standalone component architecture:
- No NgModule required
- Direct imports in components
- Cleaner, more modular code

### Signals for State Management

Uses Angular signals for reactive state:
```typescript
userInput = signal('');
messages = signal<Message[]>([]);
isLoading = signal(false);
```

### Markdown Rendering

Proposals are rendered as rich markdown with:
- Headings and formatting
- Lists and tables
- Code blocks
- Slide separators (---)

## Configuration

### API Endpoint

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'  // Backend API URL
};
```

## Development

### Run Development Server

```bash
npm start
```

Navigate to `http://localhost:4200`. The app will automatically reload when you change source files.

### Build

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

### Code Quality

The project uses strict TypeScript configuration:
- Strict null checks
- No implicit any
- No unused variables
- Consistent casing

## Components Overview

### AppComponent

Main application component featuring:
- **Welcome Screen** - Shown on first load with example prompts
- **Chat Interface** - Message list with user and AI messages  
- **Input Area** - Textarea for entering requirements
- **Action Buttons** - Clear chat and download proposal
- **Context Display** - Shows retrieved RAG context info
- **Error Handling** - Displays API errors to user

### ApiService

Handles all backend communication:
- `generateProposal(requirements)` - Generate new proposal
- `checkHealth()` - Backend health check

## Styling

### Global Styles

Defined in `src/styles.css`:
- CSS variables for theming
- Utility classes
- Markdown content styles
- Responsive design utilities

### Component Styles

Component-specific styles in `app.component.css`:
- Gradient backgrounds
- Glassmorphism effects
- Chat message bubbles
- Loading animations

## User Flow

1. **Landing** - User sees welcome screen with example prompts
2. **Input** - User types or selects a proposal requirement
3. **Send** - Clicks send or presses Enter
4. **Loading** - Loading indicator shows while processing
5. **Display** - AI-generated proposal appears as formatted slides
6. **Actions** - User can download or clear chat

## Example Prompts

The app includes helpful examples:
- E-commerce platform with React and AWS
- Mobile banking app with real-time features
- IoT dashboard for smart factory monitoring

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Future Enhancements

- Real-time streaming responses
- Proposal history
- Multiple proposal templates
- Dark/light theme toggle
- Collaborative editing
- Export to PDF/PPTX

## Troubleshooting

### Build Errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use

```bash
lsof -ti:4200 | xargs kill -9
```

### API Connection Issues

Check that backend is running on port 3000 and CORS is properly configured.

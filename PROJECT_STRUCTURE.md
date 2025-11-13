# FE-DATN Project Structure

## 📁 Directory Organization

```
src/
├── assets/              # Static assets (images, fonts, etc.)
├── components/          # Reusable components
│   ├── common/         # Common/shared components
│   ├── layout/         # Layout components (Header, Footer)
│   └── shared/         # Shared utility components
├── hooks/              # Custom React hooks
├── pages/              # Page-level components (routes)
│   ├── About/
│   │   ├── About.tsx
│   │   └── index.ts
│   ├── Blog/
│   │   ├── Blog.tsx
│   │   └── index.ts
│   ├── Contact/
│   │   ├── Contact.tsx
│   │   └── index.ts
│   ├── Home/
│   │   ├── Home.tsx
│   │   ├── Home.css
│   │   └── index.ts
│   ├── Rooms/
│   │   ├── Rooms.tsx          # Main Rooms component (from palatin)
│   │   ├── Rooms.css          # Styles from palatin template
│   │   ├── RoomsNew.tsx       # Alternative Rooms component
│   │   ├── RoomsEnhanced.css
│   │   ├── README.md
│   │   └── index.ts
│   ├── Services/
│   │   ├── Services.tsx
│   │   └── index.ts
│   └── README.md
├── styles/             # Global styles and themes
├── App.tsx             # Main App component
├── App.css
├── main.tsx            # Entry point
└── index.css
```

## 🎯 Design Principles

### 1. Feature-Based Organization
Each page has its own folder containing:
- Component file
- Related styles
- Sub-components (if needed)
- Tests (if needed)
- Documentation

### 2. Barrel Exports
Each folder has an `index.ts` file for cleaner imports:
```tsx
// Instead of:
import Home from './pages/Home/Home';

// Use:
import Home from './pages/Home';
```

### 3. Path Aliases
Configure in `tsconfig.app.json` and `vite.config.ts`:
```tsx
import Home from '@/pages/Home';
import Header from '@/components/layout/Header';
import useAuth from '@/hooks/useAuth';
```

## 📝 Naming Conventions

### Files
- **Components**: PascalCase (e.g., `Header.tsx`, `BookRoomButton.tsx`)
- **Styles**: Match component name (e.g., `Header.css`, `Rooms.css`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`, `useBooking.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`, `api.ts`)

### Folders
- **PascalCase** for component folders (e.g., `Home/`, `Rooms/`)
- **camelCase** for utility folders (e.g., `utils/`, `hooks/`)

## 🔧 Configuration Files

### TypeScript Path Aliases
**tsconfig.app.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/pages/*": ["src/pages/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/styles/*": ["src/styles/*"],
      "@/assets/*": ["src/assets/*"]
    }
  }
}
```

**vite.config.ts:**
```typescript
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      // ...
    },
  },
});
```

## 📦 Component Categories

### Pages (`/pages`)
Top-level route components. Each page should:
- Be in its own folder
- Have an index.ts for exports
- Co-locate related styles
- Import from `/components` for reusable parts

### Components (`/components`)
Reusable UI components:
- **common/**: Generic reusable components (Button, Card, Modal, etc.)
- **layout/**: Layout-specific components (Header, Footer, Sidebar)
- **shared/**: Shared utility components (ScrollToTop, ErrorBoundary)

### Hooks (`/hooks`)
Custom React hooks for reusable logic:
- useAuth
- useBooking
- useForm
- etc.

## 🚀 Development Workflow

### Adding a New Page
1. Create folder in `/pages`: `src/pages/NewPage/`
2. Create component: `src/pages/NewPage/NewPage.tsx`
3. Create styles: `src/pages/NewPage/NewPage.css`
4. Create barrel export: `src/pages/NewPage/index.ts`
5. Add route in `App.tsx`

### Adding a Reusable Component
1. Determine category (common/layout/shared)
2. Create folder: `src/components/common/Button/`
3. Create component and styles
4. Create index.ts
5. Export from parent index.ts if needed

## 📚 Best Practices

1. **Co-location**: Keep related files together
2. **Barrel Exports**: Use index.ts for cleaner imports
3. **Path Aliases**: Use `@/` imports for clarity
4. **Documentation**: Add README.md for complex features
5. **Consistency**: Follow established patterns
6. **Single Responsibility**: One component per file
7. **Type Safety**: Use TypeScript properly

## 🔄 Migration from Old Structure

Files moved:
```
src/pages/About.tsx → src/pages/About/About.tsx
src/pages/Blog.tsx → src/pages/Blog/Blog.tsx
src/pages/Contact.tsx → src/pages/Contact/Contact.tsx
src/pages/Home.tsx → src/pages/Home/Home.tsx
src/pages/Home.css → src/pages/Home/Home.css
src/pages/Services.tsx → src/pages/Services/Services.tsx
src/pages/Rooms.tsx → src/pages/Rooms/Rooms.tsx
src/pages/Rooms.css → src/pages/Rooms/Rooms.css
src/pages/RoomsNew.tsx → src/pages/Rooms/RoomsNew.tsx
src/pages/RoomsEnhanced.css → src/pages/Rooms/RoomsEnhanced.css
```

## 🎨 Styling Strategy

- **Component Styles**: Co-located with component
- **Global Styles**: In `/styles` folder
- **CSS Modules**: Consider for better scoping (optional)
- **Naming**: BEM or nested selectors

## 🧪 Testing (Future)

Recommended structure:
```
src/pages/Home/
├── Home.tsx
├── Home.css
├── Home.test.tsx
└── index.ts
```

## 📖 Further Reading

- [React Folder Structure Best Practices](https://react.dev/learn/thinking-in-react)
- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Vite Configuration](https://vitejs.dev/config/)

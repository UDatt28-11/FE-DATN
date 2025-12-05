# Pages Directory Structure

This directory contains all page-level components organized by feature.

## Structure
Each page has its own folder containing:
- Component file (e.g., `About.tsx`)
- Styles (e.g., `About.css` or `About.module.css`)
- Related components (if any)
- index.ts for barrel exports

## Pages
- **About/** - About Us page
- **Blog/** - Blog/News page
- **Contact/** - Contact page
- **Home/** - Homepage
- **Rooms/** - Rooms listing page
- **Services/** - Services page

## Usage
```tsx
// Import pages using barrel exports
import Home from '@/pages/Home';
import About from '@/pages/About';
import Rooms from '@/pages/Rooms';
```

## Best Practices
1. Keep page-specific components within the page folder
2. Use barrel exports (index.ts) for cleaner imports
3. Co-locate styles with components
4. Extract reusable components to `/components`

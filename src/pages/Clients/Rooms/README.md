# Rooms Page

This folder contains all files related to the Rooms page.

## Structure
```
Rooms/
├── index.ts              # Barrel export
├── Rooms.tsx             # Main Rooms component (from palatin template)
├── Rooms.css             # Main Rooms styles (from palatin template)
├── RoomsNew.tsx          # Alternative Rooms component
└── RoomsEnhanced.css     # Enhanced Rooms styles
```

## Components
- **Rooms.tsx**: Full conversion from palatin-gh-pages/rooms.html with all original features
- **RoomsNew.tsx**: Alternative/enhanced version of Rooms page

## Usage
```tsx
import Rooms from '@/pages/Rooms';
// or
import { RoomsNew } from '@/pages/Rooms';
```

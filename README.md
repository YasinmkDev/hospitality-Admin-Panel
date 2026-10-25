# Hospitality Admin Panel

A modern, full-featured administration dashboard for hospitality management built with React, TypeScript, and Tailwind CSS. This panel provides comprehensive tools for managing rooms, reservations, housekeeping, pricing, and analytics.

## Features

### Core Management
- **Room Management** - Complete CRUD for rooms, room types, beds, and floor plans
- **Reservation System** - Handle bookings, DNR (Do Not Rent) reservations, and status tracking
- **Housekeeping** - Track room status, cleaning schedules, and staff assignments
- **Pricing & Revenue** - Dynamic room rates, seasonal pricing, and product management
- **Reminders & Notifications** - Automated alerts for maintenance, bookings, and tasks

### Analytics & Reporting
- **Dashboard** - Real-time occupancy, revenue, and performance metrics
- **Room Layout Visualizer** - Interactive floor plan management
- **Seasonal Configuration** - Flexible season and rate period management

### Technical Highlights
- **Component Library** - 40+ accessible UI components built on Radix UI primitives
- **Type Safety** - Full TypeScript coverage with strict type checking
- **Mock API Layer** - Complete development backend with realistic data
- **Responsive Design** - Mobile-first approach with adaptive layouts
- **Testing Ready** - Vitest configuration with React Testing Library

## Screens

Captured from the local dev server at desktop (1280×800) and mobile (390×844) sizes, in route order. These screens show the app's built-in demo dataset: with no Supabase credentials configured, the app falls back to its local sample data and mock auth (the login screen itself notes "Demo Sandbox Active: Pre-loaded with hotel dataset"), so no live backend was needed for these captures. The Room Rates screenshots show the Table view: the default Matrix view stays on its loading skeleton (in `src/pages/RoomRates.tsx`, the matrix loader never clears the loading flag), while Table view loads the real tariff records.

| Screen | Desktop | Mobile |
|--------|---------|--------|
| Dashboard (`/`) | ![Dashboard desktop](docs/screenshots/dashboard-desktop.png) | ![Dashboard mobile](docs/screenshots/dashboard-mobile.png) |
| Login (`/login`) | ![Login desktop](docs/screenshots/login-desktop.png) | ![Login mobile](docs/screenshots/login-mobile.png) |
| Sign up (`/signup`) | ![Sign up desktop](docs/screenshots/signup-desktop.png) | ![Sign up mobile](docs/screenshots/signup-mobile.png) |
| Forgot password (`/forgot-password`) | ![Forgot password desktop](docs/screenshots/forgot-password-desktop.png) | ![Forgot password mobile](docs/screenshots/forgot-password-mobile.png) |
| Reset password (`/reset-password`) | ![Reset password desktop](docs/screenshots/reset-password-desktop.png) | ![Reset password mobile](docs/screenshots/reset-password-mobile.png) |
| Floors (`/floors`) | ![Floors desktop](docs/screenshots/floors-desktop.png) | ![Floors mobile](docs/screenshots/floors-mobile.png) |
| Rooms (`/rooms`) | ![Rooms desktop](docs/screenshots/rooms-desktop.png) | ![Rooms mobile](docs/screenshots/rooms-mobile.png) |
| Floor Plan (`/rooms/layout`) | ![Floor plan desktop](docs/screenshots/rooms-layout-desktop.png) | ![Floor plan mobile](docs/screenshots/rooms-layout-mobile.png) |
| Beds (`/beds`) | ![Beds desktop](docs/screenshots/beds-desktop.png) | ![Beds mobile](docs/screenshots/beds-mobile.png) |
| Room Types (`/room-types`) | ![Room types desktop](docs/screenshots/room-types-desktop.png) | ![Room types mobile](docs/screenshots/room-types-mobile.png) |
| Room Features (`/room-features`) | ![Room features desktop](docs/screenshots/room-features-desktop.png) | ![Room features mobile](docs/screenshots/room-features-mobile.png) |
| Room Products (`/room-products`) | ![Room products desktop](docs/screenshots/room-products-desktop.png) | ![Room products mobile](docs/screenshots/room-products-mobile.png) |
| Room Rates (`/room-rates`, Table view) | ![Room rates desktop](docs/screenshots/room-rates-desktop.png) | ![Room rates mobile](docs/screenshots/room-rates-mobile.png) |
| Seasons (`/seasons`) | ![Seasons desktop](docs/screenshots/seasons-desktop.png) | ![Seasons mobile](docs/screenshots/seasons-mobile.png) |
| Reservations (`/reservations`) | ![Reservations desktop](docs/screenshots/reservations-desktop.png) | ![Reservations mobile](docs/screenshots/reservations-mobile.png) |
| DNR Registry (`/reservations/dnr`) | ![DNR desktop](docs/screenshots/reservations-dnr-desktop.png) | ![DNR mobile](docs/screenshots/reservations-dnr-mobile.png) |
| Housekeeping (`/housekeeping`) | ![Housekeeping desktop](docs/screenshots/housekeeping-desktop.png) | ![Housekeeping mobile](docs/screenshots/housekeeping-mobile.png) |
| Reminders (`/reminders`) | ![Reminders desktop](docs/screenshots/reminders-desktop.png) | ![Reminders mobile](docs/screenshots/reminders-mobile.png) |
| Settings (`/settings`) | ![Settings desktop](docs/screenshots/settings-desktop.png) | ![Settings mobile](docs/screenshots/settings-mobile.png) |
| Not Found (unknown URL) | ![Not found desktop](docs/screenshots/not-found-desktop.png) | ![Not found mobile](docs/screenshots/not-found-mobile.png) |

## Tech Stack

| Category | Technologies |
|----------|--------------|
| Framework | React 18, TypeScript 5 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS, shadcn/ui |
| UI Primitives | Radix UI, Lucide Icons |
| Routing | React Router DOM 6 |
| State | React Hooks, Context API |
| Testing | Vitest, React Testing Library |
| Linting | ESLint, TypeScript ESLint |
| Package Manager | Bun / npm |

## Project Structure

```
src/
├── components/
│   ├── ui/           # 40+ reusable UI components
│   ├── common/       # Shared business components
│   └── layout/       # Layout components (AdminLayout)
├── hooks/            # Custom React hooks
├── lib/              # Utilities, types, mock API
├── pages/            # 15 page-level components
├── test/             # Test setup and examples
└── App.tsx           # Main application with routing
```

## Getting Started

### Prerequisites
- Node.js 18+ or Bun 1.0+
- npm 9+ or Bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hospitalityAdminPanel

# Install dependencies
bun install  # or npm install

# Start development server
bun dev      # or npm run dev
```

### Available Scripts

```bash
bun dev          # Start development server
bun build        # Build for production
bun preview      # Preview production build
bun test         # Run tests
bun lint         # Run ESLint
bun typecheck    # Run TypeScript compiler check
```

## Key Components

### UI Components (src/components/ui/)
Built on Radix UI primitives with Tailwind CSS styling:
- **Form Controls**: Input, Select, Checkbox, Radio, Switch, Textarea, OTP Input
- **Navigation**: Breadcrumb, Pagination, Tabs, NavigationMenu, Menubar, Sidebar
- **Feedback**: Alert, Toast, Dialog, Drawer, Popover, Tooltip, Sonner Toaster
- **Data Display**: Table, Card, Badge, Avatar, Progress, Skeleton, Chart
- **Layout**: Accordion, Collapsible, Separator, Sheet, Resizable, ScrollArea
- **Advanced**: Command Palette, Calendar, Carousel, Context Menu, Dropdown Menu

### Pages (src/pages/)
| Page | Description |
|------|-------------|
| Dashboard | Overview with stats, charts, recent activity |
| Rooms | Room grid with status, type, floor filters |
| RoomTypes | Room type CRUD with features & pricing |
| Beds | Bed management per room |
| Floors | Floor plan management |
| Reservations | Booking calendar & list views |
| ReservationsDnr | Do-Not-Rent reservation tracking |
| Housekeeping | Room status board, staff assignments |
| Reminders | Task & maintenance reminders |
| RoomFeatures | Amenity & feature management |
| RoomProducts | Minibar & service product inventory |
| RoomRates | Dynamic pricing rules & seasons |
| Seasons | Seasonal period configuration |
| RoomLayout | Visual room layout editor |
| Settings | Application configuration |

## Mock API

The project includes a complete mock API layer (`src/lib/mockApi.ts`) with:
- In-memory data persistence
- Simulated network delays
- Full CRUD operations for all entities
- Realistic hospitality data generators

## Theming

Customizable design system in `src/lib/theme.ts`:
- Navy/Gold/Ivory color palette
- Light/dark mode support
- Status color semantic tokens
- CSS variable based theming

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint with React/TypeScript rules
- Prettier formatting (configured via ESLint)
- Component-first architecture

### Adding Components
1. Create component in `src/components/ui/` or appropriate subfolder
2. Follow Radix UI composition patterns
3. Export from `components.json` for shadcn/ui CLI
4. Add Storybook stories (if applicable)

### State Management
- Prefer React Context for global state
- Use custom hooks for reusable logic
- Keep components pure and testable

## Testing

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage

# Watch mode
bun test --watch
```

## Deployment

### Build for Production
```bash
bun build
# Output in dist/
```

### Docker (Example)
```dockerfile
FROM oven/bun:1.0-alpine
WORKDIR /app
COPY package*.json ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun build
EXPOSE 3000
CMD ["bun", "preview"]
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues, please open a GitHub issue or contact the development team.

---

Built with ❤️ for the hospitality industry
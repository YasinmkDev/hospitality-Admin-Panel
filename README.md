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
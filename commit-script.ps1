#!/usr/bin/env pwsh

# Set the project directory
$projectDir = "C:\Users\Admin0\Desktop\myproject\frontendwebApp\hospitalityAdminPanel"
Set-Location $projectDir

# Ensure we're in the git repo
if (-not (Test-Path ".git")) {
    git init
}

# Commit schedule: Day -> [List of files to commit that day]
$commitPlan = @{
    "2026-05-11" = @(
        @("src/lib/types.ts", "Add core type definitions for hospitality entities"),
        @("src/lib/theme.ts", "Add theme configuration with color palette"),
        @("src/lib/utils.ts", "Add utility functions for class merging"),
        @("src/lib/mockData.ts", "Add mock data generators for development"),
        @("src/lib/mockApi.ts", "Add mock API layer with CRUD operations"),
        @("src/hooks/use-toast.ts", "Add toast notification hook with state management"),
        @("src/hooks/use-mobile.tsx", "Add responsive mobile detection hook"),
        @("src/components/ui/use-toast.ts", "Add toast hook re-export for UI components"),
        @("src/components/ui/button.tsx", "Add Button component with variants"),
        @("src/components/ui/input.tsx", "Add Input component with styling"),
        @("src/components/ui/label.tsx", "Add Label component for form fields"),
        @("src/components/ui/card.tsx", "Add Card component for content containers"),
        @("src/components/ui/badge.tsx", "Add Badge component for status indicators"),
        @("src/components/ui/avatar.tsx", "Add Avatar component for user profiles")
    )
    "2026-05-12" = @(
        @("src/components/ui/accordion.tsx", "Add Accordion component for collapsible sections"),
        @("src/components/ui/alert.tsx", "Add Alert component for notifications"),
        @("src/components/ui/alert-dialog.tsx", "Add AlertDialog for confirmations"),
        @("src/components/ui/aspect-ratio.tsx", "Add AspectRatio component for media"),
        @("src/components/ui/breadcrumb.tsx", "Add Breadcrumb navigation component"),
        @("src/components/ui/calendar.tsx", "Add Calendar component for date selection"),
        @("src/components/ui/checkbox.tsx", "Add Checkbox component for forms"),
        @("src/components/ui/collapsible.tsx", "Add Collapsible component for content"),
        @("src/components/ui/command.tsx", "Add Command palette component"),
        @("src/components/ui/context-menu.tsx", "Add ContextMenu for right-click actions"),
        @("src/components/ui/dialog.tsx", "Add Dialog component for modals")
    )
    "2026-05-13" = @(
        @("src/components/ui/drawer.tsx", "Add Drawer component for slide-out panels"),
        @("src/components/ui/dropdown-menu.tsx", "Add DropdownMenu for actions"),
        @("src/components/ui/form.tsx", "Add Form components with validation"),
        @("src/components/ui/hover-card.tsx", "Add HoverCard for preview tooltips"),
        @("src/components/ui/input-otp.tsx", "Add OTP Input component"),
        @("src/components/ui/menubar.tsx", "Add Menubar for application menus"),
        @("src/components/ui/navigation-menu.tsx", "Add NavigationMenu for app navigation"),
        @("src/components/ui/pagination.tsx", "Add Pagination component"),
        @("src/components/ui/popover.tsx", "Add Popover for floating content"),
        @("src/components/ui/progress.tsx", "Add Progress bar component"),
        @("src/components/ui/radio-group.tsx", "Add RadioGroup for selections"),
        @("src/components/ui/resizable.tsx", "Add Resizable panels component"),
        @("src/components/ui/scroll-area.tsx", "Add ScrollArea with custom scrollbars"),
        @("src/components/ui/select.tsx", "Add Select component for dropdowns"),
        @("src/components/ui/separator.tsx", "Add Separator for visual dividers"),
        @("src/components/ui/sheet.tsx", "Add Sheet component for mobile drawers")
    )
    "2026-05-14" = @(
        @("src/components/ui/sidebar.tsx", "Add Sidebar layout component"),
        @("src/components/ui/skeleton.tsx", "Add Skeleton loading placeholders"),
        @("src/components/ui/slider.tsx", "Add Slider for range input"),
        @("src/components/ui/sonner.tsx", "Add Sonner toast integration"),
        @("src/components/ui/switch.tsx", "Add Switch toggle component"),
        @("src/components/ui/table.tsx", "Add Table component for data display"),
        @("src/components/ui/tabs.tsx", "Add Tabs component for content switching"),
        @("src/components/ui/textarea.tsx", "Add Textarea for multi-line input"),
        @("src/components/ui/toast.tsx", "Add Toast notification component"),
        @("src/components/ui/toaster.tsx", "Add Toaster for toast rendering"),
        @("src/components/ui/toggle.tsx", "Add Toggle button component"),
        @("src/components/ui/toggle-group.tsx", "Add ToggleGroup for grouped toggles")
    )
    "2026-05-15" = @(
        @("src/components/ui/tooltip.tsx", "Add Tooltip component for hover hints"),
        @("src/components/ui/carousel.tsx", "Add Carousel component for slideshows"),
        @("src/components/ui/chart.tsx", "Add Chart component for data visualization"),
        @("src/components/NavLink.tsx", "Add NavLink wrapper for routing"),
        @("src/components/common/CustomFieldsEditor.tsx", "Add CustomFieldsEditor for dynamic forms"),
        @("src/components/common/PageHeader.tsx", "Add PageHeader for consistent page titles"),
        @("src/components/common/StatCard.tsx", "Add StatCard for dashboard metrics"),
        @("src/components/layout/AdminLayout.tsx", "Add AdminLayout with sidebar navigation"),
        @("src/App.tsx", "Add main App component with routing"),
        @("src/main.tsx", "Add application entry point"),
        @("src/vite-env.d.ts", "Add Vite environment type declarations")
    )
    "2026-05-16" = @(
        @("src/pages/Dashboard.tsx", "Add Dashboard page with overview stats"),
        @("src/pages/Rooms.tsx", "Add Rooms management page"),
        @("src/pages/RoomTypes.tsx", "Add RoomTypes configuration page"),
        @("src/pages/Beds.tsx", "Add Beds management page"),
        @("src/pages/Floors.tsx", "Add Floors management page"),
        @("src/pages/Reservations.tsx", "Add Reservations management page"),
        @("src/pages/ReservationsDnr.tsx", "Add DNR Reservations page"),
        @("src/pages/Housekeeping.tsx", "Add Housekeeping status page"),
        @("src/pages/Reminders.tsx", "Add Reminders management page"),
        @("src/pages/RoomFeatures.tsx", "Add RoomFeatures configuration page"),
        @("src/pages/RoomProducts.tsx", "Add RoomProducts inventory page"),
        @("src/pages/RoomRates.tsx", "Add RoomRates pricing page"),
        @("src/pages/Seasons.tsx", "Add Seasons configuration page"),
        @("src/pages/RoomLayout.tsx", "Add RoomLayout visualizer page"),
        @("src/pages/Settings.tsx", "Add Settings configuration page")
    )
    "2026-05-17" = @(
        @("src/pages/Index.tsx", "Add Index page as landing"),
        @("src/pages/NotFound.tsx", "Add NotFound 404 page"),
        @("src/test/setup.ts", "Add test setup configuration"),
        @("src/test/example.test.ts", "Add example test file"),
        @("src/index.css", "Add global styles with Tailwind imports"),
        @("src/App.css", "Add App-specific styles"),
        @("package.json", "Add project dependencies and scripts"),
        @("package-lock.json", "Add lockfile for dependency versions"),
        @("vite.config.ts", "Add Vite build configuration"),
        @("tsconfig.json", "Add TypeScript base configuration"),
        @("tsconfig.app.json", "Add app-specific TS config"),
        @("tsconfig.node.json", "Add Node-specific TS config")
    )
    "2026-05-18" = @(
        @("tailwind.config.ts", "Add Tailwind CSS configuration"),
        @("postcss.config.js", "Add PostCSS configuration"),
        @("eslint.config.js", "Add ESLint configuration"),
        @("components.json", "Add shadcn/ui components config"),
        @("index.html", "Add HTML entry point"),
        @("public/favicon.ico", "Add favicon"),
        @("public/placeholder.svg", "Add placeholder image"),
        @("public/robots.txt", "Add robots.txt for SEO"),
        @(".gitignore", "Add git ignore rules"),
        @("bun.lockb", "Add Bun lockfile"),
        @("vitest.config.ts", "Add Vitest configuration"),
        @("README.md", "Add initial project README")
    )
}

# Function to commit a file with specific date
function Commit-File {
    param(
        [string]$filePath,
        [string]$message,
        [string]$date
    )
    
    $fullPath = Join-Path $projectDir $filePath
    
    if (-not (Test-Path $fullPath)) {
        Write-Warning "File not found: $filePath"
        return
    }
    
    # Add the file
    git add "$filePath"
    
    # Commit with specific date
    $env:GIT_AUTHOR_DATE = "$date"
    $env:GIT_COMMITTER_DATE = "$date"
    
    git commit -m "$message"
    
    Write-Host "Committed: $filePath - $message"
}

# Execute commits
$commitCount = 0
$days = $commitPlan.Keys | Sort-Object
foreach ($day in $days) {
    Write-Host "=== Processing $day ===" -ForegroundColor Cyan
    $files = $commitPlan[$day]
    
    $hour = 9
    $minute = 0
    
    foreach ($fileEntry in $files) {
        $file = $fileEntry[0]
        $msg = $fileEntry[1]
        
        # Vary the time slightly for each commit
        $h = "{0:D2}" -f $hour
        $m = "{0:D2}" -f $minute
        $commitDate = "$day`T$h`:$m`:00"
        
        Commit-File -filePath $file -message $msg -date $commitDate
        $commitCount++
        
        # Increment time
        $minute += 15
        if ($minute -ge 60) {
            $minute = 0
            $hour++
        }
        if ($hour -ge 18) {
            $hour = 9
        }
        
        # Small delay to ensure timestamps differ
        Start-Sleep -Milliseconds 100
    }
}

Write-Host "=== Complete: $commitCount commits created ===" -ForegroundColor Green
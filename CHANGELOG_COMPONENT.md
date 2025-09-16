# Changelog Component

A reusable React component for displaying changelog entries with version information, dates, and expandable/collapsible functionality.

## Features

- ✅ **Expandable/Collapsible**: Click header to show/hide changelog entries
- ✅ **Structured Data**: Clean data format for easy maintenance
- ✅ **Responsive Design**: Works well on all screen sizes
- ✅ **Consistent Styling**: Matches existing design system
- ✅ **Easy to Maintain**: Simple data structure for adding new entries

## Usage

### Basic Usage

```jsx
import Changelog from '../components/Changelog'
import { changelogData } from '../data/changelog'

// Display all changelog entries
<Changelog entries={changelogData} />

// Display limited entries with custom title
<Changelog 
  entries={changelogData.slice(0, 5)} 
  title="Recent Changes" 
  defaultCollapsed={false}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `entries` | `Array` | `[]` | Array of changelog entry objects |
| `title` | `String` | `"Changelog"` | Header title for the changelog section |
| `defaultCollapsed` | `Boolean` | `false` | Whether the changelog starts collapsed |

### Entry Object Structure

```javascript
{
  version: "v7.0",           // Version number
  date: "Sep 16, 2025",      // Release date
  changes: [                 // Array of changes
    "Added new feature X",
    "Fixed bug in component Y",
    "Improved performance"
  ]
}
```

## Adding New Entries

### Method 1: Direct Edit (Recommended)

1. Open `src/data/changelog.js`
2. Add your new entry at the **top** of the `changelogData` array:

```javascript
export const changelogData = [
  // Add new entries here (newest first)
  {
    version: "v7.1",
    date: "Sep 17, 2025",
    changes: [
      "Added changelog component",
      "Improved documentation",
      "Fixed styling issues"
    ]
  },
  // ... existing entries
]
```

### Method 2: Using Utilities

```javascript
import { quickAddEntry } from '../utils/changelogUtils'

// Generate a new entry in console
quickAddEntry("v7.1", [
  "Added changelog component",
  "Improved documentation"
])
```

## Styling

The component uses CSS classes that match the existing design system:

- `.changelog-section` - Main container
- `.changelog-header` - Clickable header
- `.changelog-content` - Expandable content area
- `.changelog-entry` - Individual changelog entry
- `.changelog-version` - Version number styling
- `.changelog-date` - Date badge styling
- `.changelog-changes` - List of changes

### Compact Variant

Add the `--compact` modifier for smaller spaces:

```jsx
<div className="changelog-section--compact">
  <Changelog entries={entries} />
</div>
```

## Integration Examples

### Home Page Integration

```jsx
// src/pages/Home.jsx
import Changelog from '../components/Changelog'
import { changelogData } from '../data/changelog'

<section className="changelog-demo-section">
  <h2 className="text-title-2 u-mb-lg">Project Changelog</h2>
  <Changelog 
    entries={changelogData.slice(0, 5)} 
    title="Recent Changes" 
    defaultCollapsed={false}
  />
</section>
```

### Tool/Page Integration

```jsx
// In any tool or page
import Changelog from '../../components/Changelog'
import { changelogData } from '../../data/changelog'

<Changelog 
  entries={changelogData.slice(0, 3)} 
  title="What's New" 
  defaultCollapsed={true}
/>
```

## File Structure

```
src/
├── components/
│   └── Changelog.jsx          # Main component
├── data/
│   └── changelog.js           # Changelog data
├── utils/
│   └── changelogUtils.js      # Helper utilities
└── index.css                  # Changelog styles
```

## Best Practices

1. **Keep entries concise** - Use clear, user-friendly language
2. **Add newest entries first** - Maintain chronological order
3. **Use semantic versioning** - Follow v[major].[minor].[patch] format
4. **Date consistently** - Use "MMM DD, YYYY" format
5. **Group related changes** - Don't over-fragment small changes
6. **Limit displayed entries** - Use `.slice()` for performance

## Accessibility

- ✅ Keyboard navigation support
- ✅ Semantic HTML structure
- ✅ ARIA-friendly interactions
- ✅ Screen reader compatible

## Performance

- ✅ Only renders visible content
- ✅ Efficient re-rendering
- ✅ Minimal bundle impact
- ✅ CSS transitions for smooth UX
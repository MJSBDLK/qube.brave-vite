// Changelog data structure for easy maintenance
// Add new entries at the top of the array for chronological order (newest first)

export const changelogData = [
  {
    version: "v7.1",
    date: "Sep 16, 2025",
    changes: [
      "Built modular Changelog component system for easy maintenance",
      "Structured changelog data with utility functions for management",
      "Replaced inline changelog with reusable React component",
      "Added comprehensive documentation and helper utilities",
      "Improved changelog styling to match design system"
    ]
  },
  {
    version: "v7.0",
    date: "Sep 16, 2025",
    changes: [
      "Complete React/NextJS port with performance optimizations",
      "Built-in debouncing and throttling for smooth interactions",
      "Modular component architecture with custom hooks",
      "Real-time color sampling with visual feedback",
      "Export functionality (GPL, PNG, clipboard)",
      "Responsive design optimized for various screen sizes",
      "Performance monitoring and optimization utilities"
    ]
  },
  {
    version: "v6.6.2",
    date: "Sep 15, 2025",
    changes: [
      "Fixed brightness toggle - now properly shows/hides on both swatches",
      "Fixed comparison swatch brightness overlay display",
      "Improved brightness overlay toggle logic",
      "Editing the hex output value in the hue cube now updates the other selectors/previews",
      "One million bug fixes with the color picker"
    ]
  },
  {
    version: "v6.6.1",
    date: "Sep 14, 2025",
    changes: [
      "Added project-wide luminance algorithm selector",
      "Fixed color picker gray/black issue",
      "Fixed SV picker display mismatch",
      "Fixed brightness overlay toggle functionality",
      "Brightness overlays now respect selected algorithm",
      "Clarified HSV luminance slider behavior (color→black)"
    ]
  },
  {
    version: "v6.6",
    date: "Sep 13, 2025",
    changes: [
      "Added hue cube",
      "Added luminance algorithm picker (HSV vs CIE L*)",
      "Fixed color picker luminance slider behavior"
    ]
  },
  {
    version: "v6.5.1",
    date: "Sep 12, 2025",
    changes: [
      "Replaced luminance algorithm with CIE L*",
      "Removed redundant comparison section",
      "Tweaks to CSS"
    ]
  },
  {
    version: "v6.5",
    date: "Sep 11, 2025",
    changes: [
      "Added comparison",
      "Added luminance overlay",
      "The UI is garbage, I'll fix it later"
    ]
  },
  {
    version: "v6.4.1",
    date: "Sep 10, 2025",
    changes: [
      "Added step input for custom exponent slider"
    ]
  },
  {
    version: "v6.4",
    date: "Sep 9, 2025",
    changes: [
      "Put my thing down flip it and reverse it"
    ]
  },
  {
    version: "v6.3.1",
    date: "Sep 8, 2025",
    changes: [
      "Fixed sample overlay to cover excluded rather than included zone"
    ]
  },
  {
    version: "v6.3",
    date: "Sep 7, 2025",
    changes: [
      "Added custom parametric algorithm",
      "Removed preset algorithms other than linear",
      "Tightened up margins and padding"
    ]
  },
  {
    version: "v6.2.5",
    date: "Sep 6, 2025",
    changes: [
      "Tightened up saved ramps section CSS",
      "Added this changelog"
    ]
  },
  {
    version: "v6.2.4",
    date: "Sep 5, 2025",
    changes: [
      "Improved performance when sampling"
    ]
  },
  {
    version: "v6.2.3",
    date: "Sep 4, 2025",
    changes: [
      "Added .gpl import"
    ]
  },
  {
    version: "v6.2.2",
    date: "Sep 3, 2025",
    changes: [
      "Added alpha values to .gpl export"
    ]
  },
  {
    version: "v6.2.1",
    date: "Sep 2, 2025",
    changes: [
      "Added ability to export all ramps as .gpl palette",
      "Added ability to export all ramps as 11×X .png"
    ]
  }
]

// Utility functions for changelog management
export const addChangelogEntry = (version, date, changes) => {
  const newEntry = { version, date, changes }
  return [newEntry, ...changelogData]
}

export const getLatestVersion = () => {
  return changelogData.length > 0 ? changelogData[0].version : null
}

export const getChangelogByVersion = (version) => {
  return changelogData.find(entry => entry.version === version)
}

export const getChangelogSince = (version) => {
  const index = changelogData.findIndex(entry => entry.version === version)
  return index !== -1 ? changelogData.slice(0, index) : changelogData
}

export default changelogData
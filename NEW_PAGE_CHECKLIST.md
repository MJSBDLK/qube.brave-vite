# New Page Checklist

When adding a new page to the site, make sure to complete all of the following:

## Required

- [ ] **Create page component** - `src/pages/NewPage/NewPageComponent.jsx`
- [ ] **Create index.js** - `src/pages/NewPage/index.js` (re-exports the component)
- [ ] **Add route in App.jsx** - Add `<Route path="/newpage" />` (and trailing slash version)
- [ ] **Import in App.jsx** - Import the new page component
- [ ] **Browser title** - Add case in `getPageInfo()` switch statement in App.jsx
- [ ] **Meta description** - Same location as browser title
- [ ] **Sidebar link** - Add entry in `src/components/Sidebar.jsx`
- [ ] **Homepage card** - Add to "Latest Entries" section in `src/pages/Home.jsx`

## Optional (depending on page)

- [ ] **CSS file** - `src/pages/NewPage/newpage.css` if needed
- [ ] **Data files** - Add to `public/data/` if the page needs static data
- [ ] **Backend route** - Add to `qube-api/routes/` if server-side logic is needed
- [ ] **Data series config** - Add to `qube-api/config/dataSeries.js` for data-driven pages
- [ ] **Frontend data config** - Add to page's DATA_SERIES array if applicable

## Testing

- [ ] Page loads without errors
- [ ] Sidebar link works
- [ ] Homepage card links correctly
- [ ] Browser title shows correctly
- [ ] Mobile responsive

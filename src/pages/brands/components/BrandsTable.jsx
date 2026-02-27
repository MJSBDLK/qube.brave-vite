import { useState, useMemo, Fragment } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { ChevronRight, ChevronDown, ArrowUp, ArrowDown, Flag, CheckCircle, Columns, FileText, ClipboardCopy, Check, Info } from 'lucide-react'
import StarRating from './StarRating'
import BrandDetailPanel from './BrandDetailPanel'
import { getDeepResearchPrompt } from '../utils/prompts'

const columnHelper = createColumnHelper()

const OWNERSHIP_LABELS = {
  family: 'Family',
  founder: 'Founder',
  cooperative: 'Co-op',
  public: 'Public',
  'venture-backed': 'VC-backed',
  'private-equity': 'PE-owned',
  megacorp: 'Megacorp',
}

const WELFARE_LABELS = {
  good: 'Good',
  moderate: 'Moderate',
  poor: 'Poor',
  unknown: 'Unknown',
}

/**
 * Render a cell value distinguishing between omitted (not researched) and null (no data found).
 * - undefined (key missing from JSON): "Not researched" in muted italic
 * - null (key present, value null): "No data" in subtle text
 * - value: render normally
 */
function NoDataCell({ value, render }) {
  if (value === undefined) return <span className="text-subtle" title="Not yet researched">—</span>
  if (value === null) return <span className="text-muted" title="Researched, no data found">N/A</span>
  return render ? render(value) : value
}

function ReportCell({ brand, onViewReport }) {
  const [copied, setCopied] = useState(false)

  // Full report available
  if (brand.report) {
    return (
      <button
        className="brands-report-btn"
        onClick={(e) => {
          e.stopPropagation()
          onViewReport(brand)
        }}
        title="View research report"
      >
        <FileText size={15} />
      </button>
    )
  }

  // Summary available (no full report)
  if (brand.summary) {
    return (
      <button
        className="brands-report-btn brands-report-btn--summary"
        onClick={(e) => {
          e.stopPropagation()
          onViewReport(brand)
        }}
        title="View summary"
      >
        <Info size={15} />
      </button>
    )
  }

  // No report or summary — copy prompt
  const handleCopy = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(getDeepResearchPrompt(brand.name))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button
      className={`brands-report-btn brands-report-btn--copy ${copied ? 'brands-report-btn--copied' : ''}`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : `Copy research prompt for ${brand.name}`}
    >
      {copied ? <Check size={15} /> : <ClipboardCopy size={15} />}
    </button>
  )
}

function buildColumns(onViewReport) {
  return [
    columnHelper.display({
      id: 'expander',
      header: '',
      size: 36,
      cell: ({ row }) => (
        <button
          className="brands-expand-btn"
          onClick={row.getToggleExpandedHandler()}
          aria-label={row.getIsExpanded() ? 'Collapse details' : 'Expand details'}
        >
          {row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      ),
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      size: 160,
      cell: info => <span className="brands-cell-name">{info.getValue()}</span>,
    }),
    columnHelper.accessor('parentCompany', {
      header: 'Parent',
      size: 140,
      cell: ({ row }) => (
        <NoDataCell
          value={row.original.parentCompany}
          render={v => v}
        />
      ),
    }),
    columnHelper.accessor('ownershipType', {
      header: 'Ownership',
      size: 150,
      enableSorting: false,
      cell: info => {
        const types = info.getValue()
        if (!Array.isArray(types)) return <span className="text-subtle">—</span>
        return (
          <div className="brands-ownership-badges">
            {types.map(type => (
              <span key={type} className={`ownership-badge ownership-badge--${type}`}>
                {OWNERSHIP_LABELS[type] || type}
              </span>
            ))}
          </div>
        )
      },
    }),
    columnHelper.accessor('categories', {
      header: 'Categories',
      size: 180,
      enableSorting: false,
      cell: info => (
        <div className="brands-categories">
          {info.getValue().map(cat => (
            <span key={cat} className="category-pill">{cat}</span>
          ))}
        </div>
      ),
    }),
    columnHelper.accessor('priceTier', {
      header: 'Price',
      size: 70,
      cell: ({ row }) => (
        <NoDataCell
          value={row.original.priceTier}
          render={tier => <span className="price-tier" title={`Price tier: ${'$'.repeat(tier)}`}>{'$'.repeat(tier)}</span>}
        />
      ),
    }),
    columnHelper.accessor('starRating', {
      header: 'Rating',
      size: 110,
      cell: info => <StarRating value={info.getValue()} />,
    }),
    columnHelper.accessor(row => row.animalWelfare.rating, {
      id: 'animalWelfare',
      header: 'Welfare',
      size: 100,
      cell: ({ row }) => {
        const rating = row.original.animalWelfare.rating
        return (
          <span className={`welfare-badge welfare-badge--${rating}`}>
            {WELFARE_LABELS[rating]}
          </span>
        )
      },
    }),
    columnHelper.accessor('shitList', {
      header: 'Shit List',
      size: 80,
      cell: info => info.getValue() ? (
        <Flag size={15} className="brands-flag-danger" fill="currentColor" />
      ) : null,
    }),
    columnHelper.accessor('recommended', {
      header: 'Rec.',
      size: 70,
      cell: info => info.getValue() ? (
        <CheckCircle size={15} className="brands-flag-success" />
      ) : null,
    }),
    columnHelper.display({
      id: 'report',
      header: '',
      size: 44,
      cell: ({ row }) => (
        <ReportCell brand={row.original} onViewReport={onViewReport} />
      ),
    }),
  ]
}

export default function BrandsTable({ data, onViewReport }) {
  const [sorting, setSorting] = useState([])
  const [expanded, setExpanded] = useState({})
  const [columnVisibility, setColumnVisibility] = useState({})
  const [showColumnToggle, setShowColumnToggle] = useState(false)

  const columns = useMemo(() => buildColumns(onViewReport), [onViewReport])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, expanded, columnVisibility },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  })

  const pageCount = table.getPageCount()

  return (
    <div className="brands-table-wrapper">
      {/* Toolbar */}
      <div className="brands-table-toolbar">
        <span className="brands-result-count">
          {data.length} brand{data.length !== 1 ? 's' : ''}
        </span>
        <div className="column-toggle-container">
          <button
            className="column-toggle-btn"
            onClick={() => setShowColumnToggle(prev => !prev)}
            title="Toggle columns"
          >
            <Columns size={15} />
          </button>
          {showColumnToggle && (
            <div className="column-toggle-dropdown">
              {table.getAllLeafColumns().filter(col => col.id !== 'expander' && col.id !== 'report').map(column => (
                <label key={column.id} className="column-toggle-item">
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                  />
                  {column.columnDef.header || column.id}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="brands-table-container">
        <table className="brands-table">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      className={canSort ? 'sortable' : ''}
                      data-sorted={sorted || undefined}
                    >
                      <span className="brands-th-content">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="sort-indicator">
                            {sorted === 'asc' ? <ArrowUp size={12} /> :
                             sorted === 'desc' ? <ArrowDown size={12} /> :
                             <ArrowUp size={12} className="sort-inactive" />}
                          </span>
                        )}
                      </span>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => {
              const brand = row.original
              const rowClass = brand.shitList
                ? 'brands-row--shitlist'
                : brand.recommended
                  ? 'brands-row--recommended'
                  : ''
              return (
                <Fragment key={row.id}>
                  <tr
                    className={rowClass}
                    onClick={row.getToggleExpandedHandler()}
                    style={{ cursor: 'pointer' }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {row.getIsExpanded() && (
                    <tr className="brands-row--expanded">
                      <td colSpan={row.getVisibleCells().length}>
                        <BrandDetailPanel brand={brand} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="brands-empty">
                  No brands match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="brands-pagination">
          <button
            className="c-button c-button--ghost"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <span className="brands-page-info">
            Page {table.getState().pagination.pageIndex + 1} of {pageCount}
          </span>
          <button
            className="c-button c-button--ghost"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

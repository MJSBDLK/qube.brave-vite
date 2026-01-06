import React from 'react'
import { useLocation, Link } from 'react-router-dom'

export default function Sidebar({ isOpen, onClose }) {
	const location = useLocation()

	return (
		<>
			{/* Sidebar Overlay */}
			<div
				className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
				onClick={onClose}
			/>

			{/* Sidebar Navigation */}
			<nav className={`sidebar ${isOpen ? 'open' : ''}`}>
				<div className='sidebar-header'>
					<div className='sidebar-brand'>qube.brave</div>
					<button
						className='sidebar-close'
						onClick={onClose}
						aria-label='Close menu'
					>
						<svg
							width='20'
							height='20'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M6 18L18 6M6 6l12 12'
							></path>
						</svg>
					</button>
				</div>

				<div className='sidebar-content'>
					<div className='nav-section'>
						<div className='nav-section-title'>Navigation</div>
						<ul className='nav-list'>
							<li className='nav-item'>
								<Link
									to='/'
									className={`nav-link ${
										location.pathname === '/' ? 'nav-link--active' : ''
									}`}
									onClick={onClose}
								>
									Home
								</Link>
							</li>
						</ul>
					</div>

					<div className='nav-section'>
						<div className='nav-section-title'>Tools</div>
						<ul className='nav-list'>
							<li className='nav-item'>
								<Link
									to='/ramps'
									className={`nav-link ${
										location.pathname === '/ramps' ? 'nav-link--active' : ''
									}`}
									onClick={onClose}
								>
									Gradient Ramps
								</Link>
							</li>
							<li className='nav-item'>
								<Link
									to='/secretsanta'
									className={`nav-link ${
										location.pathname === '/secretsanta' ? 'nav-link--active' : ''
									}`}
									onClick={onClose}
								>
									Secret Santa
								</Link>
							</li>
							<li className='nav-item'>
								<Link
									to='/inflation'
									className={`nav-link ${
										location.pathname === '/inflation' ? 'nav-link--active' : ''
									}`}
									onClick={onClose}
								>
									Inflation™
								</Link>
							</li>
							<li className='nav-item'>
								<a
									href='#'
									className='nav-link nav-link--coming-soon'
									title='Coming soon, hopefully'
								>
									Brands Master Spreadsheet
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className='sidebar-footer'>
					{/* User info moved to header - keep this empty for now */}
				</div>
			</nav>
		</>
	)
}

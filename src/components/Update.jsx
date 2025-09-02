import React, { useState } from 'react'

export default function Update({ content: {date, title, badgeType, badge, content} }) {
  const [expanded, setExpanded] = useState(null)

	function toggleExpanded() {
		setExpanded(!expanded)
	}

	return (
		<div className='update-item'>
			<div className='update-header' onClick={toggleExpanded}>
				<div className='update-meta'>
					<div className='update-date'>{date}</div>
					<div className='update-title'>{title}</div>
					<div className={`c-badge c-badge--${badgeType}`}>
						{badge}
					</div>
				</div>
				<svg
					className={`update-chevron ${
						expanded ? 'rotated' : ''
					}`}
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth='2'
						d='M5 15l7-7 7 7'
					></path>
				</svg>
			</div>
			<div
				className={`update-content ${
					expanded ? 'expanded' : ''
				}`}
			>
				{content}
			</div>
		</div>
	)
}

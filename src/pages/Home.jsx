import React from 'react'
import { Link } from 'react-router-dom'
import Update from '../components/Update'
import Tagline from '../components/Tagline'
import SpicyWord from '../components/SpicyWord'

const HomePage = () => {
	const updates = [
		{
			date: 'Aug 26, 2025',
			title: 'Gradient Ramps Tool',
			badge: 'New Tool',
			badgeType: 'teal',
			content: (
				<>
					<p className="text-body text-secondary u-m-sm">
						Gradient Ramps tool available at qube.brave/ramps
					</p>
					<div className="u-flex u-gap-sm">
						<Link to="/ramps/" className="c-button c-button--primary">Try It Out</Link>
						{/* <a href="#" className="c-button c-button--ghost">View Source</a> */}
					</div>
				</>
			)
		}
	]

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
					<Tagline />
          <h1 className="text-display u-mb-lg">Quinn Davis</h1>
          <p
						className="text-body text-secondary"
						// title="I'll replace this when I think of a good description, chill"
						>
            "You must accept inconvenience on principle or you get to live in a <SpicyWord worksafe="degraded" spicy="shit" /> world"
          </p>
        </div>
      </section>

      {/* Updates Section */}
      <section className="updates-section">
        <h2 className="text-title-2 u-mb-lg">Latest Updates</h2>
        
        {updates.map((update, index) => (
          <Update key={index} content={update} />
        ))}
      </section>
    </>
  )
}

export default HomePage

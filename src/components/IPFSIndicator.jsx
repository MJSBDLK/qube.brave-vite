import React, { useState, useEffect } from 'react'
import { isIPFSUrl } from '../utils/urlUtils'
import { inProduction } from '../utils/environment'

export default function IPFSIndicator() {
  const [isIPFS, setIsIPFS] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  
  // Calculate testingMode inside the component to ensure environment is available
  const testingMode = !inProduction() && true
  
  // Debug logging (you can remove this later)
  console.log('IPFSIndicator - Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    inProduction: inProduction(),
    testingMode,
    isIPFS
  })

  useEffect(() => {
    setIsIPFS(isIPFSUrl())
  }, [])

  if (!testingMode && !isIPFS) return null

	return (
		<div 
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
			style={{ position: 'relative', cursor: 'pointer' }}
		>
			🌐
			{showTooltip && (
				<div style={{
					position: 'absolute',
					top: '100%',
					right: '0',
					backgroundColor: '#333',
					color: 'white',
					padding: '12px',
					borderRadius: '8px',
					width: '250px',
					fontSize: '14px',
					boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
					marginTop: '8px'
				}}>
					<div>
						<strong>Decentralized Hosting</strong>
						<p style={{ margin: '8px 0' }}>You're accessing this site via IPFS - a decentralized, censorship-resistant network.</p>
						<p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: '0.8' }}>Bookmark <strong>qube.brave</strong> for easier access.</p>
					</div>
				</div>
			)}
		</div>
	)
}

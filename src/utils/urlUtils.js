// Utility functions for handling IPFS URLs and domain display

/**
 * Checks if the current URL is an IPFS hash-based URL
 */
export const isIPFSUrl = () => {
  const hostname = window.location.hostname
  
  // Common IPFS gateway patterns
  const ipfsGateways = [
    /^.*\.ipfs\./,                    // *.ipfs.* (dweb.link, etc.)
    /^[a-z2-7]{59}\.ipfs\./,         // CIDv0 base32
    /^[a-f0-9]{46}\.ipfs\./,         // CIDv0 base16
    /^[a-z2-7]{59}$/,                // Direct CIDv0 base32
    /^[a-f0-9]{46}$/,                // Direct CIDv0 base16
    /^k51[a-z2-7]{56}$/,             // CIDv1 base32 (often IPNS)
    /dweb\.link/,                     // IPFS gateway
    /ipfs\.io/,                       // IPFS gateway
    /cf-ipfs\.com/,                   // Cloudflare IPFS gateway
  ]
  
  return ipfsGateways.some(pattern => pattern.test(hostname))
}

/**
 * Gets the display domain based on how the user accessed the site
 * - Real domains (mjsbdlk.com, qube.brave, etc.) → show as-is
 * - IP addresses or localhost → show "MJSBDLK"
 * - IPFS gateways → show "MJSBDLK"
 */
export const getCanonicalDomain = () => {
  const hostname = window.location.hostname

  // Known domains - show as-is
  const knownDomains = [
    'mjsbdlk.com',
    'www.mjsbdlk.com',
    'qube.brave',
    'mjsbdlk.brave',
  ]

  if (knownDomains.includes(hostname)) {
    // Strip www. prefix for cleaner display
    return hostname.replace(/^www\./, '')
  }

  // IP address, localhost, or IPFS gateway → fallback
  return 'MJSBDLK'
}

/**
 * Gets the display URL for the current page
 */
export const getDisplayUrl = (pathname = '') => {
  const domain = getCanonicalDomain()
  const cleanPath = pathname.replace(/\/$/, '')
  return cleanPath ? `${domain}${cleanPath}` : domain
}

/**
 * Updates the page title and meta tags for better UX
 */
export const updatePageMetadata = (pageTitle, description = '') => {
  // Update document title
  document.title = pageTitle
  
  // Update or create canonical link
  let canonical = document.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = `https://${getDisplayUrl(window.location.pathname)}`
  
  // Update meta description if provided
  if (description) {
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = description
  }
}

import { Star } from 'lucide-react'

export default function StarRating({ value, size = 14 }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (value >= i) {
      stars.push(<Star key={i} size={size} className="star-filled" fill="currentColor" />)
    } else if (value >= i - 0.5) {
      stars.push(
        <span key={i} className="star-half">
          <Star size={size} className="star-empty" />
          <span className="star-fill-overlay">
            <Star size={size} className="star-filled" fill="currentColor" />
          </span>
        </span>
      )
    } else {
      stars.push(<Star key={i} size={size} className="star-empty" />)
    }
  }
  return <span className="star-rating">{stars}</span>
}

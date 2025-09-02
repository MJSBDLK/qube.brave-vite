import { useSpicyMode } from '../contexts/SpicyModeContext'

function SpicyWord({worksafe, spicy}) {
	const { isSpicyMode } = useSpicyMode()

	if (isSpicyMode) {
		return spicy
	} else {
		return worksafe
	}
}

export default SpicyWord
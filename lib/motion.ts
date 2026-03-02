import type { Transition } from 'framer-motion'

/**
 * Tactical spring for interface interactions.
 * Fast settle, minimal overshoot.
 */
export const snappySpring: Transition = {
    type: 'spring',
    stiffness: 420,
    damping: 34,
    mass: 0.58,
}

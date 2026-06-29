export const EASE_SMOOTH = 'power3.out'
export const EASE_SNAPPY = 'power4.out'
export const EASE_ELASTIC = 'elastic.out(1, 0.5)'
export const EASE_EXPO = 'expo.out'
export const EASE_BACK = 'back.out(1.7)'

export const DURATION_FAST = 0.4
export const DURATION_MEDIUM = 0.8
export const DURATION_SLOW = 1.2
export const DURATION_HEADLINE = 1.0

export const STAGGER_FAST = 0.05
export const STAGGER_NORMAL = 0.1
export const STAGGER_SLOW = 0.15

export const EASE = {
  smooth: 'power3.out',
  snappy: 'power4.out',
  elastic: 'elastic.out(1, 0.5)',
  expo: 'expo.out',
  back: 'back.out(1.7)',
} as const

export const DURATION = {
  fast: 0.4,
  normal: 0.8,
  slow: 1.2,
  headline: 1.0,
} as const

export const STAGGER = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.15,
} as const

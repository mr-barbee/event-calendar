import { gsap } from 'gsap'

const useGsap = () => {
  // Register an effect for reuse
  gsap.registerEffect({
    name: 'fade',
    effect: (targets, config) => {
      return gsap.to(targets, {
        duration: config.duration,
        opacity: 1,
        delay: config.delay,
      })
    },
    defaults: {duration: 2, delay: 1},
    extendTimeline: true
  })

  return gsap
}

export default useGsap

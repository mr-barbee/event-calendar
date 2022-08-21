import { useRef, useLayoutEffect } from 'react'
import useGsap from '../../../hooks/useGsap'

export default function FadeIn({ children, vars }) {
  const el = useRef()
  const gsap = useGsap()

  useLayoutEffect(() => {
    gsap.from(el.current.children, {
      opacity: 0,
      ...vars
    });
  }, [vars, gsap])

  return <span ref={el}>{children}</span>;
}

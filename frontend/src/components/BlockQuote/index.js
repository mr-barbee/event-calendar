import { useState, useEffect, useRef } from 'react'
import useGsap from '../../hooks/useGsap'
import { useQuery } from 'react-query'
import useUtilityService from '../../api/useUtilityService'
import './style.scss'

export default function BlockQuote() {
  const blockone = useRef()
  const blocktwo = useRef()
  const blockthree = useRef()
  const blockfour = useRef()
  const gsap = useGsap()
  const [currentBlockQuote, setCurrentBlockQuote] = useState(0)
  const [blockQuotes, setBlockQuotes] = useState('')
  const [,,, getBlockQuotes] = useUtilityService()
  const { isLoading, data } = useQuery(['get-block-quotes'], () => getBlockQuotes())
  let tl = gsap.timeline()

  useEffect(() => {
    if (!isLoading && data) setBlockQuotes(data['block_quotes'])
  }, [isLoading, data, setBlockQuotes])

  useEffect(() => {
    if (blockQuotes && Object.keys(blockQuotes).length > 1) {
      const interval = setTimeout(
        () => {
          setCurrentBlockQuote((currentBlockQuote + 1) % Object.keys(blockQuotes).length)
          tl.restart()
        },
        25000
      )
      return () => {
        clearInterval(interval)
      }
    }
  }, [blockQuotes, currentBlockQuote, setCurrentBlockQuote, tl])

  useEffect(() => {
    if (blockQuotes[currentBlockQuote]) {
      tl.fade(blockone.current)
        .fade(blocktwo.current)
        .fade(blockthree.current)
        .fade(blockfour.current, {delay: 2})
        .play()
    }
  }, [blockQuotes, currentBlockQuote, gsap, tl])

  return (
    <blockquote>
      {blockQuotes[currentBlockQuote] &&
        <>
          <p className='title'>{blockQuotes[currentBlockQuote].quote}</p>
          <p>
            <span ref={blockone}>It means:&nbsp;</span>
            <span ref={blocktwo}>{blockQuotes[currentBlockQuote].meaning.substr(0, blockQuotes[currentBlockQuote].meaning.indexOf('<break>'))}</span>
            <span ref={blockthree}>{blockQuotes[currentBlockQuote].meaning.substr(blockQuotes[currentBlockQuote].meaning.indexOf('<break>') + 7 )}</span>
          </p>
          <p><cite ref={blockfour}>{blockQuotes[currentBlockQuote].author}</cite></p>
        </>
      }
    </blockquote>
  )

}

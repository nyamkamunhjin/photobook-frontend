import React, { useEffect, useRef } from 'react'

interface Props {
  textStyle: any
  autogrowStyle: any
  texts: string[]
  style: any
  className: string
}

const Text: React.FC<Props> = ({ textStyle, autogrowStyle, texts, style, className }) => {
  const textRef: any = useRef(null)

  useEffect(() => {
    textRef.current.innerHTML = ''
    texts.forEach((t) => {
      const br = document.createElement('br')
      if (t === '\n') textRef.current.append(br)
      else textRef.current.append(t)
    })
  }, [texts])

  return (
    <div className={className} style={style}>
      <div className="border" />
      <div className="autogrow" style={autogrowStyle} />
      <p ref={textRef} className="text" style={textStyle} contentEditable={false} spellCheck={false} />
    </div>
  )
}

export default Text

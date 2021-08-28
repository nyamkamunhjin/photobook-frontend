import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface Props {
  textStyle: any
  autogrowStyle: any
  texts: string[]
  style: any
  className: string
}

const Text: React.FC<Props> = ({ textStyle, autogrowStyle, texts, style, className }) => {
  const textRef: any = useRef(null)
  const isSelected = useMemo(() => {
    // urgeljlel bii selected bnu checkled
    return true
  }, [texts])

  useEffect(() => {
    textRef.current.innerHTML = ''
    texts.forEach((t) => {
      const br = document.createElement('br')
      if (t === '\n') textRef.current.append(br)
      else textRef.current.append(t)
    })
  }, [texts])
  console.log('isSelected', isSelected)

  return (
    <div className={className} style={style}>
      <div className="border" />
      <div className="autogrow" style={autogrowStyle} />
      <span ref={textRef} className="text" style={textStyle} contentEditable={isSelected} spellCheck={false} />
    </div>
  )
}

export default Text

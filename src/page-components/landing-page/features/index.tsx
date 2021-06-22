import React, { FC } from 'react'
import WidthLimiter from 'layouts/main/components/width-limiter'

interface Props {
  datas: Feature[]
}

const Features: FC<Props> = ({ datas }) => {
  return (
    <WidthLimiter className="flex flex-wrap gap-4 px-4 py-8 h-96">
      {datas.map((each) => (
        <Feature key={`feature${each.text}`} imageUrl={each.imageUrl} text={each.text} />
      ))}
    </WidthLimiter>
  )
}

export default Features

interface Feature {
  imageUrl: string
  text: string
}

const Feature: FC<Feature> = ({ imageUrl, text }) => {
  return (
    <div className="flex flex-col bg-white space-y-2 p-2 w-60 mx-auto">
      <img className="h-40 w-auto rounded object-cover" src={imageUrl} alt={text} />
      {/* <span className="font-bold text-5xl">{imageUrl}</span> */}
      <p className="font-semibold text-gray-700 text-center text-xs break-words">{text}</p>
    </div>
  )
}

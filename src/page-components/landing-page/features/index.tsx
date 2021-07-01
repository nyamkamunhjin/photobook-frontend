import React, { FC } from 'react'
import WidthLimiter from 'layouts/main/components/width-limiter'

interface Props {
  datas: Feature[]
}

const Features: FC<Props> = ({ datas }) => {
  return (
    <WidthLimiter className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 py-8 h-96">
      {datas.map((each) => (
        <Feature
          key={`feature${each.text}`}
          imageUrl={`${process.env.REACT_APP_PUBLIC_IMAGE}${each.imageUrl}`}
          text={each.text}
        />
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
    <div className="flex flex-col bg-white gap-4 p-2 w-60 py-6 mx-auto">
      <img className="h-40 w-auto rounded object-cover shadow-md" src={imageUrl} alt={text} />
      {/* <span className="font-bold text-5xl">{imageUrl}</span> */}
      <p className="font-base text-gray-600 text-center text-sm break-words">{text}</p>
    </div>
  )
}

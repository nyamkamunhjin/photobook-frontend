/* eslint-disable react/jsx-curly-brace-presence */
import React, { FC } from 'react'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { Carousel } from 'antd'
import { FormattedMessage } from 'react-intl'

interface Review {
  author: string
  text: string
}

interface Feature {
  icon: React.ReactNode
  text: string
  subText?: string | undefined
}

interface Props {
  reviews: Review[]
  features: Feature[]
}

const SocialProof: FC<Props> = ({ reviews, features }) => {
  return (
    <div className="flex justify-center items-center bg-blue-50">
      <WidthLimiter className="flex flex-col justify-start items-center py-6 px-2">
        <p className="font-semibold text-gray-800 text-xl">
          <FormattedMessage id="what_our_customers_are_saying" />
        </p>
        <Carousel className="w-96 md:w-full max-w-lg overflow-hidden" autoplay autoplaySpeed={4000}>
          {reviews.map(({ author, text }) => (
            <Review key={author} author={author} text={text} />
          ))}
        </Carousel>
        <div className="flex flex-wrap justify-evenly py-10 gap-4">
          {features.map(({ icon, subText, text }) => (
            <Content key={text} icon={icon} subText={subText} text={text} />
          ))}
        </div>
      </WidthLimiter>
    </div>
  )
}

export default SocialProof

const Review: FC<Review> = ({ author, text }) => {
  return (
    <figure className="p-8 w-full max-w-lg bg-white">
      <blockquote className="text-base font-semibold w-full" style={{ minWidth: '6rem' }}>
        <p>{text}</p>
      </blockquote>
      <figcaption className="font-semibold">
        <div className="text-blue-600">{author}</div>
      </figcaption>
    </figure>
  )
}

const Content: FC<Feature> = ({ icon, text, subText }) => {
  return (
    <figure className="flex flex-col gap-6 w-full max-w-xs items-center">
      {icon}
      <figcaption className="text-center">
        <p className="font-semibold text-gray-700 text-sm whitespace-nowrap">{text}</p>
        {subText && <p className="text-gray-600 text-xs">{subText}</p>}
      </figcaption>
    </figure>
  )
}

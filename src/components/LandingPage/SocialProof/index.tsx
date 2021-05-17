/* eslint-disable react/jsx-curly-brace-presence */
import React, { FC } from 'react'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { Carousel } from 'antd'

interface Review {
  author: string
  text: string
}

interface Feature {
  icon: React.ReactNode
  text: string
  subText: string
}

interface Props {
  reviews: Review[]
  features: Feature[]
}

const SocialProof: FC<Props> = ({ reviews, features }) => {
  return (
    <div className="flex justify-center items-center bg-blue-100">
      {/* bg-gradient-to-tr from-blue-300 to-green-300 */}
      <WidthLimiter className="flex flex-col justify-center items-center py-6 px-2">
        <p className="font-semibold text-gray-800 text-xl">What our Customers Are Saying</p>
        <Carousel className="w-96 md:w-full max-w-lg" autoplay autoplaySpeed={4000}>
          {reviews.map(({ author, text }) => (
            <Review key={author} author={author} text={text} />
          ))}
        </Carousel>
        <div className="flex flex-wrap justify-evenly py-10">
          {features.map(({ icon, subText, text }) => (
            <Content key={subText} icon={icon} subText={subText} text={text} />
          ))}
        </div>
      </WidthLimiter>
    </div>
  )
}

export default SocialProof

const Review: FC<Review> = ({ author, text }) => {
  return (
    <figure className="rounded shadow p-8 w-full max-w-lg bg-white">
      <blockquote className="text-lg font-semibold h-24">
        <p>{text}</p>
      </blockquote>
      <figcaption className="font-semibold ">
        <div className="text-blue-600">{author}</div>
      </figcaption>
    </figure>
  )
}

const Content: FC<Feature> = ({ icon, text, subText }) => {
  return (
    <figure className="flex flex-col w-full max-w-xs items-center">
      <div>{icon}</div>
      <figcaption className="text-center">
        <div className="font-semibold text-gray-700 text-sm">{text}</div>
        <div className="text-gray-600 text-xs">{subText}</div>
      </figcaption>
    </figure>
  )
}

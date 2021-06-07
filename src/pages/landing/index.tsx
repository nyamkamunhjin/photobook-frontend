/* eslint-disable react/jsx-curly-brace-presence */
import React from 'react'
import './style.scss'
import { Features, Hero, ImageCarousel, ShowCaseProducts, SocialProof } from 'page-components/landing-page'
import { useRequest } from 'ahooks'
import {
  listLandingPageHero,
  listLandingPageImageCarousel,
  listLandingPageReview,
  listLandingPageShowCase,
} from '../../api'

const datas = [
  {
    icon: 'ICON',
    text: '7-day Guaranteed Shipping*',
    subText: 'Your merchandise will be produced within the shortest period of time and delivered to you',
  },
  {
    icon: 'ICON',
    text: 'Free Shipping*',
    subText: 'You are entitled for FREE shipping upon spending a qualifying amount on our products.',
  },
  {
    icon: 'ICON',
    text: '100% Quality Guarantee',
    subText: '100% Quality Guarantee is all about your satisfaction. We want you to be HAPPY.',
  },
  {
    icon: 'ICON',
    text: 'Free Personalization Options',
    subText: 'Providing you with full personalization and creative control is the nature of our business.',
  },
]
const Home = () => {
  const hero = useRequest(listLandingPageHero)
  const showCases = useRequest(listLandingPageShowCase)
  const imageCarousels = useRequest(listLandingPageImageCarousel)
  const reviews = useRequest(listLandingPageReview)
  return (
    <>
      {hero.data && <Hero datas={hero.data} />}
      {showCases.data && <ShowCaseProducts cards={showCases.data} />}
      {imageCarousels.data && <ImageCarousel datas={imageCarousels.data} />}
      <Features />
      {reviews.data && <SocialProof reviews={reviews.data} features={datas} />}
    </>
  )
}

export default Home

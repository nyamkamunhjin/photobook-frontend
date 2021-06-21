/* eslint-disable react/jsx-curly-brace-presence */
import React from 'react'
import { useRequest } from 'ahooks'
import { listLandingPageHero, listLandingPageImageCarousel, listLandingPageReview, listLandingPageShowCase } from 'api'
import { Features, Hero, ImageCarousel, ShowCaseProducts, SocialProof } from 'page-components/landing-page'
import { ReactComponent as Hour24 } from 'assets/icons/landing-page-icons/24-hours.svg'
import { ReactComponent as Shipped } from 'assets/icons/landing-page-icons/shipped.svg'
import { ReactComponent as Happy } from 'assets/icons/landing-page-icons/happy.svg'
import { ReactComponent as Editing } from 'assets/icons/landing-page-icons/editing.svg'
import './style.scss'

const datas = [
  {
    icon: <Hour24 className="w-12 h-12" />,
    text: 'Тогтмол үйл ажиллагаа',
    // subText: 'Your merchandise will be produced within the shortest period of time and delivered to you',
  },
  {
    icon: <Shipped className="w-12 h-12" />,
    text: 'Шуурхай хүргэлт',
    // subText: 'You are entitled for FREE shipping upon spending a qualifying amount on our products.',
  },
  {
    icon: <Happy className="w-12 h-12" />,
    text: 'Чанартай, сэтгэл хангалуун',
    // subText: '100% Quality Guarantee is all about your satisfaction. We want you to be HAPPY.',
  },
  {
    icon: <Editing className="w-12 h-12" />,
    text: 'Хүссэн загвараар',
    // subText: 'Providing you with full personalization and creative control is the nature of our business.',
  },
]
const Home: React.FC = () => {
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

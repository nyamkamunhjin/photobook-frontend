/* eslint-disable react/jsx-curly-brace-presence */
import React from 'react'
import './style.scss'
import { Features, Hero, ImageCarousel, ShowCaseProducts, SocialProof } from 'components'

const tempHeroData = [
  {
    imageUrl: 'https://media1.pbwwcdn.net/pages/imagewrap-book/imagewrap_banner.jpg',
    text: 'CREATE CUSTOM WALL ART',
  },
  {
    imageUrl:
      'https://fiverr-res.cloudinary.com/images/q_auto,f_auto/gigs/133758452/original/f9d2136ee29d58d55d35f2184569edeceabaa05b/do-wedding-album-layout-design.jpg',
    text: 'CAROUSEL',
  },
  {
    imageUrl:
      'https://fiverr-res.cloudinary.com/images/q_auto,f_auto/gigs/133758452/original/f9d2136ee29d58d55d35f2184569edeceabaa05b/do-wedding-album-layout-design.jpg',
    text: 'CAROUSEL',
  },
  {
    imageUrl:
      'https://prd-static-default-2.sf-cdn.com/resources/images/store/2020/global/2000x852/xWF-168120_Site-Update_Linen_Photo_Books_2000x852.jpg.pagespeed.ic.ndblXZXI6l.jpg',
    text: 'CREATE ',
  },
]

const tempDatas = [
  {
    author: 'Yesulen G.',
    text: `“CSS is the only framework that I've seen scale
  on large teams. It’s easy to customize, adapts to any design,
  and the build size is tiny.”`,
  },
  {
    author: 'Yesulen G.',
    text: `“CSS is the only framework that I've seen scale
  on large teams. It’s easy to customize, adapts to any design,
  and the build size is tiny.”`,
  },
  {
    author: 'Yesulen G.',
    text: `“CSS is the only framework that I've seen scale
  on large teams. It’s easy to customize, adapts to any design,
  and the build size is tiny.”`,
  },
]

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
  return (
    <>
      <Hero datas={tempHeroData} />
      <ShowCaseProducts />
      <ImageCarousel datas={tempHeroData} />
      <Features />
      <SocialProof reviews={tempDatas} features={datas} />
    </>
  )
}

export default Home

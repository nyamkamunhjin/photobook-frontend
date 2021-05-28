import AliceCarousel from 'react-alice-carousel'
import React, { FC } from 'react'
import 'react-alice-carousel/lib/alice-carousel.css'

interface Combo {
  imageUrl: string
  text: string
}

interface Props {
  datas: Combo[]
}

const Hero: FC<Props> = ({ datas }) => {
  return (
    <AliceCarousel
      autoPlay
      disableDotsControls
      disableButtonsControls
      autoPlayStrategy="none"
      autoPlayInterval={4000}
      animationDuration={4000}
      // animationType="fadeout"
      mouseTracking
      infinite
    >
      {datas.map(({ imageUrl, text }) => (
        <Content key={imageUrl} imageUrl={imageUrl} text={text} />
      ))}
    </AliceCarousel>
  )
}

export default Hero

const Content: FC<Combo> = ({ imageUrl, text }) => (
  <div className="w-full flex justify-center items-center" style={{ height: '60vh' }}>
    <div
      className="w-full h-full grid place-items-center bg-center"
      style={{
        backgroundImage: `url(${imageUrl})`,
      }}
    >
      <div className="font-extrabold text-5xl">{text}</div>
    </div>
  </div>
)

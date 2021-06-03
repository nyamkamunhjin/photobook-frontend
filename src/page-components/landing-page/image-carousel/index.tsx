import React, { FC } from 'react'
import AliceCarousel from 'react-alice-carousel'
import 'react-alice-carousel/lib/alice-carousel.css'

interface Combo {
  imageUrl: string
  text: string
}

interface Props {
  datas: Combo[]
}

const ImageCarousel: FC<Props> = ({ datas }) => {
  return (
    <AliceCarousel
      // autoPlay
      disableDotsControls
      disableButtonsControls
      autoPlayStrategy="none"
      // autoPlayInterval={2000}
      // animationDuration={2000}
      // animationType="fadeout"
      mouseTracking
      infinite
    >
      {datas.map(({ imageUrl, text }) => (
        <Content key={`ImageCarousel${imageUrl}`} imageUrl={imageUrl} text={text} />
      ))}
    </AliceCarousel>
  )
}

export default ImageCarousel

const Content: FC<Combo> = ({ imageUrl, text }) => (
  <div className="w-full flex justify-center items-center bg-yellow-100 h-96">
    <div
      className="w-full h-full grid place-items-center bg-center bg-cover"
      style={{
        backgroundImage: `url(${process.env.REACT_APP_PUBLIC_IMAGE}${imageUrl})`,
      }}
    >
      <div className="font-extrabold text-5xl">{text}</div>
    </div>
  </div>
)

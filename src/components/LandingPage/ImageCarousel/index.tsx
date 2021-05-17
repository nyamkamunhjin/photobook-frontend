import { Carousel } from 'antd'
import React, { FC } from 'react'

interface Combo {
  imageUrl: string
  text: string
}

interface Props {
  datas: Combo[]
}

const ImageCarousel: FC<Props> = ({ datas }) => {
  return (
    <Carousel className="ease-out" autoplay>
      {datas.map(({ imageUrl, text }) => (
        <Content imageUrl={imageUrl} text={text} />
      ))}
    </Carousel>
  )
}

export default ImageCarousel

const Content: FC<Combo> = ({ imageUrl, text }) => (
  <div className="w-full flex justify-center items-center bg-yellow-100 h-96">
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

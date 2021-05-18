import { Carousel } from 'antd'
import React, { FC } from 'react'

interface Combo {
  imageUrl: string
  text: string
}

interface Props {
  datas: Combo[]
}

const Hero: FC<Props> = ({ datas }) => {
  return (
    <Carousel className="ease-out" autoplay>
      {datas.map(({ imageUrl, text }) => (
        <Content key={imageUrl} imageUrl={imageUrl} text={text} />
      ))}
    </Carousel>
  )
}

export default Hero

const Content: FC<Combo> = ({ imageUrl, text }) => (
  <div className="w-full flex justify-center items-center" style={{ height: '50vh' }}>
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

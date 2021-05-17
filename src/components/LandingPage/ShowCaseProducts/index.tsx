import React, { FC } from 'react'
import WidthLimiter from 'layouts/main/components/width-limiter'

interface Props {
  a?: string
}

const ShowCaseProducts: FC<Props> = (props) => {
  return (
    <WidthLimiter className="flex flex-col justify-center items-center p-4 space-y-4">
      <div className="flex justify-center gap-4">
        <button className="font-bold text-lg text-gray-500" type="button">
          New
        </button>
        <button className="font-bold text-lg text-gray-500" type="button">
          Popular
        </button>
        <button className="font-bold text-lg text-gray-500" type="button">
          Special
        </button>
      </div>
      <div className="flex flex-wrap md:flex-nowrap justify-center gap-4 ">
        {Array.from(Array(3).keys()).map(() => (
          <Card
            imageSrc="https://i.pinimg.com/originals/ef/4d/a2/ef4da23ec1edc9ffee8391fbd49b6982.jpg"
            name="Wall Art"
          />
        ))}
      </div>
    </WidthLimiter>
  )
}

export default ShowCaseProducts

interface CardProps {
  name: string
  imageSrc: string
  alt?: string
}
const Card: FC<CardProps> = ({ name, imageSrc, alt = '' }) => {
  return (
    <div
      className="flex flex-col rounded-sm items-center bg-white gap-2 p-2 w-full max-w mx-auto ease-in transition-shadow hover:shadow-lg"
      style={{ maxWidth: '20rem' }}
    >
      <img className="rounded object-cover h-60" src={imageSrc} alt={alt} />
      <p className="font-bold text-lg my-4">{name}</p>
    </div>
  )
}

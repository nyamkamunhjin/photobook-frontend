import React, { FC } from 'react'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { FormattedMessage } from 'react-intl'

interface Props {
  cards: CardProps[]
}

const ShowCaseProducts: FC<Props> = ({ cards }) => {
  return (
    <WidthLimiter className="flex flex-col justify-center items-center p-4 py-10 gap-4 h-96">
      <div className="flex justify-center gap-4">
        <button className="btn-text text-base font-light" type="button">
          <FormattedMessage id="new" />
        </button>
        <button className="btn-text text-base font-light" type="button">
          <FormattedMessage id="popular" />
        </button>
        <button className="btn-text text-base font-light" type="button">
          <FormattedMessage id="special" />
        </button>
      </div>
      <div className="flex flex-wrap md:flex-nowrap justify-center gap-10">
        {cards.map((card) => (
          <Card key={card.name + card.imageUrl} imageUrl={card.imageUrl} name={card.name} />
        ))}
      </div>
    </WidthLimiter>
  )
}

export default ShowCaseProducts

interface CardProps {
  name: string
  imageUrl: string
}
const Card: FC<CardProps> = ({ name, imageUrl }) => {
  return (
    <div
      className="flex flex-col rounded-sm items-center bg-white gap-2 p-2 w-full max-w mx-auto overflow-hidden"
      style={{ maxWidth: '20rem' }}
    >
      <img
        className="object-cover h-72 transform duration-500 ease-out hover:scale-110"
        src={`${process.env.REACT_APP_PUBLIC_IMAGE}${imageUrl}`}
        alt="card"
      />
      <p className="font-light text-sm text-gray-500 my-4">{name}</p>
    </div>
  )
}

import React, { FC } from 'react'
import { Template } from 'interfaces'
import { Link } from 'react-router-dom'
import { currencyFormat } from '../../utils'

interface Props {
  template: Template
  rowSize?: 1 | 2 | 3 | 4 | 6
}

const TemplateCard: FC<Props> = ({ template, rowSize = 3 }) => {
  return (
    <Link
      className="p-2 rounded hover:shadow-lg hover:bg-white ease-in transition-all"
      style={{ width: `calc(100% / ${rowSize} - 0.5rem` }}
      to={`/product/${template.templateType?.name}/template/${template.id}`}
    >
      <article>
        <div>
          <img
            className="w-full rounde"
            src={`${process.env.REACT_APP_PUBLIC_IMAGE}${template.imageUrl}`}
            alt={template.name}
            width={300}
            height={300}
          />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-gray-700 text-sm">{template.name}</span>
          {typeof template.discountPrice === 'number' && (
            <span className="text-gray-700 font-light ">
              <span className="text-sm font-normal line-through">{currencyFormat(template.price)}</span> ₮{' '}
              <span className="text-bg font-normal text-red-400">
                (-{Math.round((1 - template.discountPrice / template.price) * 100)} %)
              </span>
            </span>
          )}
          <span className="font-light">
            <span className="text-sm font-normal">{currencyFormat(template.discountPrice || template.price)}</span> ₮
          </span>
        </div>
      </article>
    </Link>
  )
}

export default TemplateCard

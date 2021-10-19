import React, { FC } from 'react'
import { Template } from 'interfaces'
import { Link } from 'react-router-dom'
import { currencyFormat } from '../../utils'

interface Props {
  template: Template
  rowSize?: 1 | 2 | 3 | 4 | 6
}

const TemplateCard: FC<Props> = ({ template, rowSize = 3 }) => {
  const urlParams = new URLSearchParams(window.location.search)
  const tradephoto = urlParams.get('tradephoto')

  return (
    <Link
      className="p-2 rounded hover:shadow-xl hover:bg-white ease-in transition-all transform hover:-translate-y-1 border border-gray-200"
      style={{ width: `calc(100% / ${rowSize} - 0.5rem` }}
      to={`/product/${template.templateType?.name}/template/${template.id}${
        tradephoto ? `?tradephoto=${tradephoto}` : ''
      }`}
    >
      <article className="flex flex-col gap-4">
        <div>
          <img
            className="w-full rounded object-cover bg-gray-50"
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

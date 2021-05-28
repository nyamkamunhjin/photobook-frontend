import React, { FC } from 'react'
import { Template } from 'interfaces'
import { Link } from 'react-router-dom'

interface Props {
  template: Template
  rowSize?: 1 | 2 | 3 | 4 | 6
}
console.log(process.env)

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
            className="w-full rounded"
            src={`${process.env.REACT_APP_PUBLIC_IMAGE}${template.imageUrl}`}
            alt={template.name}
            width={300}
            height={300}
          />
        </div>
        <div className="flex flex-col items-center">
          <p className="text-black">{template.name}</p>
          <p className="text-black">{template.price} ₮</p>
        </div>
      </article>
    </Link>
  )
}

export default TemplateCard

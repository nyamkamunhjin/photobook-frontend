import React, { FC } from 'react'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { FormattedMessage } from 'react-intl'
import { Category } from 'interfaces'
import useRouter from 'components/router'
import { Loading } from 'components'

interface SubmenuPhotoprint {
  categories: { list: Category[] }
  imageLeft: string
  imageRight: string
}

const SubmenuPhotobook: FC<SubmenuPhotoprint> = ({ categories, imageLeft, imageRight }) => {
  const router = useRouter()

  return (
    <WidthLimiter
      className="flex flex-wrap sm:flex-nowrap bg-white shadow animate-fade-in"
      style={{ minHeight: '25rem' }}
    >
      {imageLeft && (
        <img className="w-52 object-cover" src={`${process.env.REACT_APP_PUBLIC_IMAGE}${imageLeft}`} alt="photoprint" />
      )}
      <div className="mx-4 p-4">
        <button
          className="focus:outline-none hover:text-blue-300 font-semibold"
          type="button"
          onClick={() => router.replace(`/editor/print?template=2`)}
        >
          <FormattedMessage id="print" />
        </button>
        <p className="font-semibold ">
          <FormattedMessage id="categories" />
        </p>
        <ul className="flex flex-col gap-2">
          {categories?.list ? (
            categories?.list?.flatMap((each) => {
              if (each.templateType?.name === 'photobook') {
                return (
                  <li className="text-gray-600 text-xs" key={each.id + each.name + each.templateType}>
                    <button
                      className="focus:outline-none hover:text-blue-300"
                      type="button"
                      onClick={() => router.replace(`/product/photoprint?all=false&category=${each.id}`)}
                    >
                      {each.name}
                    </button>
                  </li>
                )
              } else return []
            })
          ) : (
            <Loading fill={false} />
          )}
        </ul>
      </div>
      {imageRight && (
        <img
          className="w-52 object-cover ml-auto"
          src={`${process.env.REACT_APP_PUBLIC_IMAGE}${imageRight}`}
          alt="photoprint"
        />
      )}
    </WidthLimiter>
  )
}

export default SubmenuPhotobook

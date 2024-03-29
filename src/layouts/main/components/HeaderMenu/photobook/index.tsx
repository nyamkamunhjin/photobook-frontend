import React, { FC } from 'react'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { FormattedMessage } from 'react-intl'
import { Category, CoverType } from 'interfaces'
import useRouter from 'components/router'
import { Loading } from 'components'

interface SubmenuPhotobook {
  coverTypes: CoverType[]
  categories: { list: Category[] }
  imageLeft: string
  imageRight: string
}

const SubmenuPhotobook: FC<SubmenuPhotobook> = ({ coverTypes, categories, imageLeft, imageRight }) => {
  const router = useRouter()

  return (
    <WidthLimiter
      className="flex flex-wrap sm:flex-nowrap bg-white shadow animate-fade-in"
      style={{ minHeight: '25rem' }}
    >
      {imageLeft && (
        <img className="w-52 object-cover" src={`${process.env.REACT_APP_PUBLIC_IMAGE}${imageLeft}`} alt="photobook" />
      )}
      <div className="mx-4 p-4">
        <p className="font-semibold">
          <FormattedMessage id="photobook" />
        </p>
        <ul className="flex flex-col gap-2">
          {coverTypes ? (
            coverTypes?.map((each) => (
              <li className="text-gray-600 text-xs" key={each.id + each.name + each.quantity}>
                <button
                  className="focus:outline-none hover:text-blue-300"
                  type="button"
                  onClick={() => router.replace('/product/photobook')}
                >
                  {each.name}
                </button>
              </li>
            ))
          ) : (
            <Loading fill={false} />
          )}
        </ul>
      </div>

      <div className="mx-4 p-4">
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
                      onClick={() => router.replace(`/product/photobook?all=false&category=${each.id}`)}
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
      <div className="mx-4 p-4">
        <p className="font-semibold ">
          <FormattedMessage id="montage" />
        </p>
        <ul className="flex flex-col gap-2">
          {categories?.list ? (
            categories?.list?.flatMap((each) => {
              if (each.templateType?.name === 'montage') {
                return (
                  <li className="text-gray-600 text-xs" key={each.id + each.name + each.templateType}>
                    <button
                      className="focus:outline-none hover:text-blue-300"
                      type="button"
                      onClick={() => router.replace(`/product/montage?all=false&category=${each.id}`)}
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
          alt="photobook"
        />
      )}
    </WidthLimiter>
  )
}

export default SubmenuPhotobook

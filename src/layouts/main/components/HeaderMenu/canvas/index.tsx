import React, { FC } from 'react'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { FormattedMessage } from 'react-intl'
import { Category } from 'interfaces'
import useRouter from 'components/router'
import { Loading } from 'components'

interface SubmenuCanvas {
  categories: {
    list?: Category[]
  }
  imageLeft: string
  imageRight: string
}

const SubmenuCanvas: FC<SubmenuCanvas> = ({ categories, imageLeft, imageRight }) => {
  const router = useRouter()

  return (
    <WidthLimiter className="flex flex-wrap sm:flex-nowrap bg-white shadow-lg" style={{ minHeight: '25rem' }}>
      {imageLeft && (
        <img className="w-52 object-cover" src={`${process.env.REACT_APP_PUBLIC_IMAGE}${imageLeft}`} alt="canvas" />
      )}

      <div className="mx-4 p-4">
        <p className="font-semibold ">
          <FormattedMessage id="canvas" />
        </p>
        <ul className="flex flex-col gap-2">
          {categories?.list ? (
            categories?.list?.flatMap((each) => {
              if (each.templateType?.name === 'canvas') {
                return (
                  <li className="text-gray-600 text-xs" key={each.id + each.name + each.templateType}>
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={() => router.replace(`/product/canvas?all=false&category=${each.id}`)}
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
        <p className="font-semibold">
          <FormattedMessage id="frame" />
        </p>
        <ul className="flex flex-col gap-2">
          {categories?.list ? (
            categories?.list?.flatMap((each) => {
              if (each.templateType?.name === 'frame') {
                return (
                  <li className="text-gray-600 text-xs" key={each.id + each.name}>
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={() => router.replace(`/product/frame?all=false&category=${each.id + each.name}`)}
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
          alt="canvas"
        />
      )}
    </WidthLimiter>
  )
}

export default SubmenuCanvas

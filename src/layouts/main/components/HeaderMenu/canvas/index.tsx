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
      <img className="w-52 object-cover" src={imageLeft} alt="photobook" />

      <div className="mx-4 p-4">
        <p className="font-semibold ">
          <FormattedMessage id="canvas" />
        </p>
        <ul className="flex flex-col gap-2">
          {categories?.list ? (
            categories?.list?.flatMap((each) => {
              if (each.templateType?.name === 'canvas') {
                return (
                  <li className="text-gray-600 text-xs" key={each.id}>
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
                  <li className="text-gray-600 text-xs" key={each.id}>
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={() => router.replace(`/product/frame?all=false&category=${each.id}`)}
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
      <img className="w-52 object-cover ml-auto" src={imageRight} alt="photobook" />
    </WidthLimiter>
  )
}

export default SubmenuCanvas

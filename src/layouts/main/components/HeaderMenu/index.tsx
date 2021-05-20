/* eslint-disable import/no-extraneous-dependencies */
import React, { FC } from 'react'
import Tippy from '@tippyjs/react/headless'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { FormattedMessage } from 'react-intl'
import { listCoverType, listTemplateCategory } from 'api'
import { Category, CoverType } from 'interfaces'
import { useRequest } from 'ahooks'
import useRouter from 'components/router'
import { Loading } from 'components'

const HeaderMenu: FC = () => {
  const router = useRouter()

  const coverTypes = useRequest(() => listCoverType())
  const categories = useRequest(() => listTemplateCategory({ current: 0, pageSize: 100 }, {}))

  return (
    <nav className="flex gap-4 justify-center items-center h-12">
      <button
        type="button"
        className="text-gray-500 tracking-widest text-base font-light focus:outline-none border-solid border-blue-400 hover:border-b-2 transition-transform"
        key="photobook"
        onClick={() => router.replace('/')}
      >
        <FormattedMessage id="home" />
      </button>

      <Tippy
        interactive
        placement="bottom"
        maxWidth="100%"
        render={() => (
          <div className="w-screen mx-auto" style={{ minWidth: '20rem' }}>
            <SubmenuPhotobook coverTypes={coverTypes.data} categories={categories.data} />
          </div>
        )}
      >
        <button
          type="button"
          className="text-gray-500 tracking-widest text-base font-light focus:outline-none border-solid border-blue-400 hover:border-b-2 transition-transform"
          key="home"
        >
          <FormattedMessage id="photobook" />
        </button>
      </Tippy>

      <Tippy
        interactive
        placement="bottom"
        maxWidth="100%"
        render={() => (
          <div className="w-screen mx-auto" style={{ minWidth: '20rem' }}>
            <SubmenuCanvas categories={categories.data} />
          </div>
        )}
      >
        <button
          type="button"
          className="text-gray-500 tracking-widest text-base font-light focus:outline-none border-solid border-blue-400 hover:border-b-2 transition-transform"
          key="home"
        >
          <FormattedMessage id="canvas" />
        </button>
      </Tippy>
    </nav>
  )
}

export default HeaderMenu

interface SubmenuPhotobook {
  coverTypes: CoverType[]
  categories: { list: Category[] }
}

const SubmenuPhotobook: FC<SubmenuPhotobook> = ({ coverTypes, categories }) => {
  const router = useRouter()

  return (
    <WidthLimiter className="flex flex-wrap sm:flex-nowrap bg-white rounded shadow">
      <img
        className="w-52 object-cover rounded-l"
        src="https://i.pinimg.com/originals/ef/4d/a2/ef4da23ec1edc9ffee8391fbd49b6982.jpg"
        alt="photobook"
      />
      <div className="mx-4 p-4">
        <p className="font-semibold">
          <FormattedMessage id="photobook" />
        </p>
        <ul className="flex flex-col gap-2">
          {coverTypes ? (
            coverTypes?.map((each) => (
              <li className="text-gray-600 text-xs" key={each.id}>
                <button
                  className="focus:outline-none"
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
                  <li className="text-gray-600 text-xs" key={each.id}>
                    <button
                      className="focus:outline-none"
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
      <img
        className="w-52 object-cover rounded-r ml-auto"
        src="https://i.pinimg.com/originals/ef/4d/a2/ef4da23ec1edc9ffee8391fbd49b6982.jpg"
        alt="photobook"
      />
    </WidthLimiter>
  )
}

interface SubmenuCanvas {
  categories: {
    list?: Category[]
  }
}

const SubmenuCanvas: FC<SubmenuCanvas> = ({ categories }) => {
  const router = useRouter()

  return (
    <WidthLimiter className="flex flex-wrap sm:flex-nowrap bg-white rounded shadow">
      <img
        className="w-52 object-cover rounded-l"
        src="https://i.pinimg.com/originals/ef/4d/a2/ef4da23ec1edc9ffee8391fbd49b6982.jpg"
        alt="photobook"
      />

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
      <img
        className="w-52 object-cover rounded-r ml-auto"
        src="https://i.pinimg.com/originals/ef/4d/a2/ef4da23ec1edc9ffee8391fbd49b6982.jpg"
        alt="photobook"
      />
    </WidthLimiter>
  )
}

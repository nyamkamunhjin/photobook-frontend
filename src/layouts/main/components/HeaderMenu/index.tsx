/* eslint-disable import/no-extraneous-dependencies */
import React, { FC } from 'react'
import Tippy from '@tippyjs/react/headless'
import { FormattedMessage } from 'react-intl'
import { listCoverType, listHeaderAd, listTemplateCategory } from 'api'
import { useRequest } from 'ahooks'
import useRouter from 'components/router'
import SubmenuPhotobook from './photobook'
import SubmenuCanvas from './canvas'

const HeaderMenu: FC = () => {
  const router = useRouter()

  const coverTypes = useRequest(() => listCoverType())
  const categories = useRequest(() => listTemplateCategory({ current: 0, pageSize: 100 }, {}))

  const canvasAd = useRequest(() => listHeaderAd('canvas'))
  const photobookAd = useRequest(() => listHeaderAd('photobook'))

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
            <SubmenuPhotobook
              coverTypes={coverTypes.data}
              categories={categories.data}
              imageLeft={photobookAd.data?.find((each: any) => each.left)?.imageUrl}
              imageRight={photobookAd.data?.find((each: any) => !each.left)?.imageUrl}
            />
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
            {canvasAd.data && (
              <SubmenuCanvas
                categories={categories.data}
                imageLeft={canvasAd.data?.find((each: any) => each.left)?.imageUrl}
                imageRight={canvasAd.data?.find((each: any) => !each.left)?.imageUrl}
              />
            )}
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
      <button
        type="button"
        className="text-gray-500 tracking-widest text-base font-light focus:outline-none border-solid border-blue-400 hover:border-b-2 transition-transform"
        key="photobook"
        onClick={() => router.replace('/')}
      >
        <FormattedMessage id="about_us" />
      </button>
      <button
        type="button"
        className="text-gray-500 tracking-widest text-base font-light focus:outline-none border-solid border-blue-400 hover:border-b-2 transition-transform"
        key="photobook"
        onClick={() => router.replace('/')}
      >
        <FormattedMessage id="gift_card" />
      </button>
    </nav>
  )
}

export default HeaderMenu

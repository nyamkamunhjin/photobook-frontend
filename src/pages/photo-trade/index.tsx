import { useRequest } from 'ahooks'
import React, { useEffect, useRef, useState } from 'react'
import { buyPhoto, getTradePhoto, listTradePhoto } from 'api'
import Masonry from 'react-masonry-css'
import { TradePhoto } from 'interfaces'
import './style.scss'
import { CustomButton, Loading } from 'components'
import { Modal, notification, Image } from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'
import { currencyFormat } from 'utils'

const PhotoTrade: React.FC = () => {
  const intl = useIntl()
  const [id, setId] = useState<number>()
  const containerRef = useRef<HTMLDivElement>(null)
  const tradePhotos = useRequest(
    (data: any) =>
      listTradePhoto(
        {
          current: (data?.list?.length || 0) / 10,
          pageSize: 10,
        },
        {}
      ),
    {
      // debounceInterval: 500,
      loadMore: true,
      ref: containerRef,
    }
  )

  const tradePhoto = useRequest(getTradePhoto, {
    manual: true,
  })

  useEffect(() => {
    if (id) {
      tradePhoto.run(id.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <div className="p-4 flex flex-col gap-4 items-center" ref={containerRef}>
      {/* <Pagination
        className="ml-auto"
        {...(tradePhotos.pagination as any)}
        pageSize={20}
        onShowSizeChange={tradePhotos.pagination.onChange}
      /> */}
      <Masonry breakpointCols={3} className="my-masonry-grid" columnClassName="my-masonry-grid_column">
        {!tradePhotos.data?.loading ? (
          tradePhotos.data?.list.map((each: TradePhoto) => (
            <CustomButton
              key={each.id}
              className="w-full focus:outline-none"
              onClick={() => {
                setId(each.id)
              }}
            >
              <Image
                className="w-full h-auto"
                src={each.imageUrl}
                alt={each.photoName}
                fallback="/logo.png"
                preview={false}
                loading="lazy"
              />
            </CustomButton>
          ))
        ) : (
          <Loading />
        )}
      </Masonry>
      {!tradePhotos.noMore && (
        <CustomButton className="btn-primary" onClick={tradePhotos.loadMore} disabled={tradePhotos.loadingMore}>
          {tradePhotos.loadingMore ? 'Loading more...' : 'Click to load more'}
        </CustomButton>
      )}
      {tradePhoto.data && (
        <Modal
          // title={tradePhoto.data.photoName}
          className="w-full max-w-6xl"
          centered
          visible={!!id}
          onCancel={() => setId(undefined)}
          footer={<div />}
        >
          <div className="flex items-start p-2 gap-2 min-h-screen">
            <Image
              className="w-full"
              preview={false}
              src={tradePhoto.data?.imageUrl}
              alt={tradePhoto.data?.photoName}
            />
            <div className="w-full flex flex-col gap-4 p-2 items-start">
              <span className="text-4xl mt-0 pt-0">{tradePhoto.data?.photoName}</span>
              <p className="text-base">{tradePhoto.data?.description}</p>
              <span className="text-base font-semibold">
                <FormattedMessage id="photo_by" />:{' '}
                <span className="font-normal">
                  {tradePhoto.data?.user.firstName} {tradePhoto.data?.user.lastName}
                </span>
              </span>
              <span className="text-2xl font-semibold text-gray-600">
                {currencyFormat(tradePhoto.data?.price)}
                <span className="text-xs font-bold">₮</span>
              </span>
              <CustomButton
                className="btn-primary"
                onClick={() =>
                  buyPhoto(tradePhoto.data?.id).then((res) => {
                    if (res) notification.success({ message: intl.formatMessage({ id: 'success!' }) })
                  })
                }
              >
                <FormattedMessage id="buy" />
              </CustomButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default PhotoTrade

import React, { FC } from 'react'

interface Props {
  bannerImageUrl: string
  children: React.ReactNode
}

const ProductWrapper: FC<Props> = ({ bannerImageUrl, children }) => {
  return (
    <div className="flex flex-col">
      <div className="aspect-w-4 aspect-h-1">
        {bannerImageUrl && (
          <img
            className="w-full object-cover"
            alt="banner"
            src={`${process.env.REACT_APP_PUBLIC_IMAGE}${bannerImageUrl}`}
          />
        )}
      </div>
      <div className="pt-8">{children}</div>
    </div>
  )
}

export default ProductWrapper

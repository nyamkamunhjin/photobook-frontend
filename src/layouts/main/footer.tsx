import { FacebookFilled, InstagramFilled, YoutubeFilled } from '@ant-design/icons'
import React, { FC } from 'react'
import WidthLimiter from './components/width-limiter'

const Footer: FC = () => {
  return (
    <footer className=" h-80 bg-gray-50">
      <WidthLimiter className="flex items-center ">
        <div className="text-4xl font-extrabold">LOGO</div>
        <div className="flex ml-auto space-x-10">
          <div>
            <p className="font-semibold">Байршил</p>
            <p>ХУД,11-р хороо, Кингтовэр, 118-р байр, B1-101 тоот </p>
          </div>
          <div>
            <p className="font-semibold">Холбоо барих</p>
            <p>+97677778800</p>
            <p>+97699063395</p>
            <p>printing@exastudio.mn</p>
          </div>
          <div className="flex self-center space-x-4">
            <YoutubeFilled className="text-3xl" />
            <FacebookFilled className="text-3xl" />
            <InstagramFilled className="text-3xl" />
          </div>
        </div>
      </WidthLimiter>
    </footer>
  )
}

export default Footer

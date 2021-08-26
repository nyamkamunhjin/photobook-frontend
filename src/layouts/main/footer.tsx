import { FacebookFilled, InstagramFilled, YoutubeFilled } from '@ant-design/icons'
import React from 'react'
import { FormattedMessage } from 'react-intl'
import WidthLimiter from './components/width-limiter'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 pt-4" style={{ minWidth: '20rem' }}>
      <WidthLimiter className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:justify-evenly items-center my-16">
        <div className="">
          <img className="h-12" src="/exa-logo.webp" alt="Exa Logo" />
        </div>
        <div className="flex flex-col items-center">
          <p className="font-semibold">Байршил</p>
          <p>ХУД,11-р хороо, Кингтовэр, 118-р байр, B1-101 тоот </p>
        </div>
        <div className="flex flex-col items-center">
          <p className="font-semibold">Холбоо барих</p>
          <p>+97677778800</p>
          <p>+97699063395</p>
          <p>printing@exastudio.mn</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <a href="https://www.youtube.com/channel/UCyHJHxuusHYL3Q_Lgphx8Sg">
            <YoutubeFilled className="text-3xl" />
          </a>
          <a href="https://www.facebook.com/EXAstudioMongolia">
            <FacebookFilled className="text-3xl" />
          </a>
          <a href="https://www.instagram.com/exastudio_mongolia/">
            <InstagramFilled className="text-3xl" />
          </a>
        </div>
      </WidthLimiter>
      <div className="flex justify-center flex-wrap mx-auto gap-4 bg-gray-900 text-gray-50 mt-auto">
        <a className="text-inherit hover:text-blue-400 py-2 px-4" href="/about-us">
          <FormattedMessage id="about_us" />
        </a>
        <a
          className="text-inherit hover:text-blue-400 py-2 px-4"
          href="http://www.exastudio.mn/index.php/2-uncategorised/20-careers"
        >
          <FormattedMessage id="careers" />
        </a>
        <a
          className="text-inherit hover:text-blue-400 py-2 px-4"
          href="http://www.exastudio.mn/index.php/2-uncategorised/19-contact"
        >
          <FormattedMessage id="contact" />
        </a>
        <a className="text-inherit hover:text-blue-400 py-2 px-4" href="#">
          <FormattedMessage id="terms_of_service" />
        </a>
        <a className="text-inherit hover:text-blue-400 py-2 px-4" href="#">
          <FormattedMessage id="privacy_policy" />
        </a>
      </div>
    </footer>
  )
}

export default Footer

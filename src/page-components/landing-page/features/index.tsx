import React, { FC } from 'react'
import WidthLimiter from 'layouts/main/components/width-limiter'

const data: Feature[] = [
  {
    icon: 'ICON',
    text: 'Онцгой мөчүүдээ зургийн цомогт бичиж үлдээ.',
  },
  {
    icon: 'ICON',
    text: 'Алмайран харж байсан зургаа ханан дээрээ өндөр нягтаршилтайгаар хэвлүүлэн хар',
  },
  {
    icon: 'ICON',
    text: 'Ус, нар, салхи шороонд 200 жил болсон ч гандахгүй фото хэвлэл.',
  },
  {
    icon: 'ICON',
    text: 'Танд Станд хэвлэл маш яаралтай хэрэгтэй болсон уу.',
  },
  {
    icon: 'ICON',
    text: 'Манай сайтаар үйлчлүүлэхэд танд мэргэжлийн хүнд програм дээр ажиллах, дизайны чадварууд огт шаардлагагүй.',
  },
  {
    icon: 'ICON',
    text: 'Брошур танилцуулга гэх мэт  зөвхөн олон тоогоор хэвлэгдэх боломжтой зүйлийг ч нэг ширхгээр хэвлэнэ.',
  },
]

const Features: FC = () => {
  return (
    <WidthLimiter className="flex flex-wrap gap-4 px-4 py-8 h-96">
      {data.map((each) => (
        <Feature key={`feature${each.text}`} icon={each.icon} text={each.text} />
      ))}
    </WidthLimiter>
  )
}

export default Features

interface Feature {
  icon: React.ReactNode
  text: string
}

const Feature: FC<Feature> = ({ icon, text }) => {
  return (
    <div className="flex flex-col bg-white space-y-2 p-2 w-80 mx-auto">
      <div className="h-40 w-full text-center grid place-items-center">
        <span className="font-bold text-5xl">{icon}</span>
      </div>
      <p className="font-light text-gray-500 text-center">{text}</p>
    </div>
  )
}

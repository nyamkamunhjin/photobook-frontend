import React, { FC } from 'react'
import WidthLimiter from 'layouts/main/components/width-limiter'

interface Props {
  a?: string
}

const Features: FC<Props> = (props) => {
  return (
    <WidthLimiter className="flex flex-wrap gap-4 p-4">
      {Array.from(Array(6).keys()).map(() => (
        <Feature
          icon="ICON"
          text="Брошур танилцуулга гэх мэт зөвхөн олон тоогоор хэвлэгдэх боломжтой зүйлийг ч нэг ширхгээр хэвлэнэ"
        />
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
    <div className="flex flex-col rounded-sm bg-white space-y-2 p-2 w-80 mx-auto ease-in transition-shadow hover:shadow-lg">
      <div className="h-40 w-full text-center grid place-items-center">
        <span className="font-bold text-5xl">{icon}</span>
      </div>
      <p className="font-semibold text-gray-600 text-center">{text}</p>
    </div>
  )
}

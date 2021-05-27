import React, { FC } from 'react'
import WidthLimiter from 'layouts/main/components/width-limiter'

const Features: FC = () => {
  return (
    <WidthLimiter className="flex flex-wrap gap-4 px-4 py-8">
      {Array.from(Array(6).keys()).map((a) => (
        <Feature
          key={`feature${a}`}
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
    <div className="flex flex-col bg-white space-y-2 p-2 w-80 mx-auto">
      <div className="h-40 w-full text-center grid place-items-center">
        <span className="font-bold text-5xl">{icon}</span>
      </div>
      <p className="font-light text-gray-500 text-center">{text}</p>
    </div>
  )
}

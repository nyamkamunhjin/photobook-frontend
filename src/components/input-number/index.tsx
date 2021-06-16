/* eslint-disable react/button-has-type */
import { InputNumber, InputNumberProps } from 'antd'
import { CgMathPlus, CgMathMinus } from 'react-icons/cg'
import React, { useState, useEffect } from 'react'

const CustomInputNumber: React.FC<InputNumberProps> = ({ className = '', value = 0, onChange, ...rest }) => {
  const [ivalue, setIValue] = useState<number>(value as number)
  useEffect(() => {
    setIValue(value as number)
  }, [value])
  return (
    <>
      <div className="border-b flex items-center text-center h-full">
        <div>
          <CgMathMinus
            className="cursor-pointer"
            size={15}
            onClick={() => {
              if (onChange) {
                onChange(ivalue - 1)
                setIValue(ivalue - 1)
              }
            }}
          />
        </div>
        <InputNumber
          onChange={(v) => {
            if (onChange) {
              onChange(v)
              setIValue(v as number)
            }
          }}
          value={ivalue}
          className={`${className} border-none`}
          {...rest}
        />
        <div>
          <CgMathPlus
            className="cursor-pointer"
            size={15}
            onClick={() => {
              if (onChange) {
                onChange(ivalue + 1)
                setIValue(ivalue + 1)
              }
            }}
          />
        </div>
      </div>
    </>
  )
}

export default CustomInputNumber

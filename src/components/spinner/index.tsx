import React from 'react'
import spinnerGif from './spinner.svg'

const Spinner = () => (
  <>
    <img alt="Loading..." src={spinnerGif} style={{ width: '200px', margin: 'auto', display: 'block' }} />
  </>
)

export default Spinner

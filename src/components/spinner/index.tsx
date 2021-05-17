import React from 'react'
import spinnerGif from './spinner.gif'

const Spinner = () => (
  <>
    <img alt="Loading..." src={spinnerGif} style={{ width: '200px', margin: 'auto', display: 'block' }} />
  </>
)

export default Spinner

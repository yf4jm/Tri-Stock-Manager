import React from 'react'

const A = ({children,href}) => {
  return (
    <a className=' bg-blue-500 text-white px-4 py-2 rounded' href={href}>{children}</a>
  )
}

export default A
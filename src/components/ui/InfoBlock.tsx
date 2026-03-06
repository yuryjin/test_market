import React from 'react'

interface InfoBlockProps {
  children: React.ReactNode
  width?: string | number
  height?: string | number
  className?: string
}

const InfoBlock: React.FC<InfoBlockProps> = ({ children, width, height, className = '' }) => {
  return (
    <div className={`bg-[#BEBDC81F] rounded-[26px] ${className}`}
    style={{ minWidth: width, minHeight: height }}
    >
      <div className="p-[16px]">
        {children}
      </div>
    </div>
  )
}

export default InfoBlock
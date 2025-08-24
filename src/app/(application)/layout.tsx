import Header from '@/components/elements/site/header'
import React from 'react'

function layout({ children }: { children: React.ReactNode }) {
  return (
   <>
   <Header />
   {children}
   </>
  )
}

export default layout

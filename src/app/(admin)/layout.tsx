import Header from '@/components/elements/site/header'
import React from 'react'

function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}

export default AdminSectionLayout

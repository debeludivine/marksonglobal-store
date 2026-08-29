import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="pt-[calc(2.5rem+5rem)] md:pt-[calc(2.5rem+5rem)]">
        {children}
      </main>
      <Footer />
    </>
  )
}

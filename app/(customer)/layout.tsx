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
      <main className="pt-[calc(1.5rem+3.5rem)] sm:pt-[calc(2rem+4rem)] md:pt-[calc(2.5rem+5rem)]">
        {children}
      </main>
      <Footer />
    </>
  )
}

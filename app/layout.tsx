import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BizzAI - AI Phone Agents',
  description: 'Build automated AI phone agents that answer calls and collect customer information',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  )
}


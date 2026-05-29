import { Metadata } from 'next'
import {
  Bricolage_Grotesque,
  Inter,
  JetBrains_Mono,
  Space_Grotesk,
} from 'next/font/google'

import { getBaseURL } from '@lib/util/env'
import { ProgressBar } from '@modules/common/components/progress-bar'
import { ThemeProvider } from '@modules/common/components/theme-provider'
import { Toaster } from 'sonner'

import 'styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

// Editorial display face — tight, condensed, made for poster-scale type.
// Used for hero headlines, drop callouts, and lookbook captions.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
})

// Monospace for metadata strips ("DROP 01 / SS26 / BLR").
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: 'EnteraVeil',
    template: '%s | EnteraVeil',
  },
  description: 'Anime streetwear from beyond the veil.',
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${bricolage.variable} ${jetbrains.variable}`}
    >
      <body className="font-body text-basic-primary">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          // disableTransitionOnChange
        >
          <ProgressBar />
          <Toaster position="bottom-right" offset={65} closeButton />
          <main className="relative">{props.children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}

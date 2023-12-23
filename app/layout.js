import '../styles/global.css';

import { ReduxProvider } from '@/redux/provider';

export const metadata = {
  title: 'Skribbl clone',
  description: 'Play skribbl with friends',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <div className="bg_overlay" />
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  )
}

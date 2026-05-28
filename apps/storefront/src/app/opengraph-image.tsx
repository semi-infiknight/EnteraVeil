import { ImageResponse } from 'next/og'

export const alt = 'EnteraVeil — anime streetwear from beyond the veil'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
          color: '#F5F5F4',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 140,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: '#F5F5F4',
          }}
        >
          EnteraVeil
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 30,
            color: '#FFB627',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          anime streetwear · from beyond the veil
        </div>
      </div>
    ),
    { ...size }
  )
}

import { IconProps } from 'types/icon'

export const Wordmark = (props: IconProps) => {
  return (
    <svg
      width="180"
      height="28"
      viewBox="0 0 180 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>EnteraVeil</title>
      <text
        x="0"
        y="21"
        fill="currentColor"
        style={{
          fontFamily: 'var(--font-heading), "Space Grotesk", system-ui, sans-serif',
          fontWeight: 600,
          fontSize: '22px',
          letterSpacing: '-0.02em',
        }}
      >
        EnteraVeil
      </text>
    </svg>
  )
}

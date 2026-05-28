import { VariantColor } from 'types/strapi'

export const getVariantColor = (
  variantName: string,
  colors: VariantColor[] | null | undefined
) => {
  const color = colors?.find((c) => c.Name === variantName)

  return color?.Type?.[0]
}

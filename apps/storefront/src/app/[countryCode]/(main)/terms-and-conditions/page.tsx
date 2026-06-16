import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function TermsAndConditionsPage({ params }: Props) {
  const { countryCode } = await params
  redirect(`/${countryCode}/legal/terms-and-conditions`)
}
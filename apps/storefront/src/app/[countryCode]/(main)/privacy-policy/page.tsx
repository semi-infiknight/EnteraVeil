import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { countryCode } = await params
  redirect(`/${countryCode}/legal/privacy-policy`)
}
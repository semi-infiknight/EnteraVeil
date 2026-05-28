import { Metadata } from 'next'

import { getAboutUs, getExploreBlogData } from '@lib/data/fetch'
import { Banner } from '@modules/content/components/banner'
import { BasicContentSection } from '@modules/content/components/basic-content-section'
import { FramedTextSection } from '@modules/content/components/framed-text-section'
import { NumericalSection } from '@modules/content/components/numerical-section'
import { ExploreBlog } from '@modules/home/components/explore-blog'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'At EnteraVeil, we craft anime-inspired streetwear that lets you carry a piece of the veil into the everyday.',
}

export default async function AboutUsPage() {
  const aboutRes = await getAboutUs().catch(() => ({ data: null }))
  const {
    Banner: bannerData,
    OurStory,
    WhyUs,
    OurCraftsmanship,
    Numbers,
  } = (aboutRes?.data as any) ?? {}

  const blogRes = await getExploreBlogData().catch(() => ({ data: null }))
  const posts = blogRes?.data

  return (
    <>
      {bannerData && <Banner data={bannerData} />}
      {OurStory && <BasicContentSection data={OurStory} />}
      {WhyUs && <FramedTextSection data={WhyUs} />}
      {OurCraftsmanship && <BasicContentSection data={OurCraftsmanship} />}
      {Numbers && <NumericalSection data={Numbers} />}
      {posts && <ExploreBlog posts={posts} />}
    </>
  )
}

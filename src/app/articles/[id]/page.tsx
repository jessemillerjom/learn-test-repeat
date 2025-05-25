import { Metadata } from 'next'
import ArticleClient from '@/components/ArticleClient'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Article ${params.id}`,
  }
}

export default function ArticlePage({ params }: Props) {
  return <ArticleClient id={params.id} />;
} 
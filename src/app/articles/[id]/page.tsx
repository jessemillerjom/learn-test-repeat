import ArticleClient from '@/components/ArticleClient';

export default function ArticlePage({ params }: { params: { id: string } }) {
  return <ArticleClient id={params.id} />;
} 
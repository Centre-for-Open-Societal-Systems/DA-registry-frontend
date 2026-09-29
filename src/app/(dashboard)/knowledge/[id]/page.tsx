import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticle } from "@/features/communication";
import { ArticleView } from "./components/ArticleView";

export async function generateMetadata(props: PageProps<"/knowledge/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const article = getArticle(id);
  return { title: article ? `${article.title} | OpenAgriNet` : "Article not found | OpenAgriNet" };
}

export default async function ArticlePage(props: PageProps<"/knowledge/[id]">) {
  const { id } = await props.params;
  const article = getArticle(id);
  if (!article) notFound();
  return <ArticleView article={article} />;
}

import { AssistantGraphState } from "../state/assistant.state";

export async function responseNode(
  state: AssistantGraphState
): Promise<Partial<AssistantGraphState>> {

  // Map retrieved documents metadata into simple product objects
  const products = (state.retrievedDocuments ?? []).map((doc: any) => ({
    id: doc.metadata?.id ?? doc.metadata?._id ?? null,
    slug: doc.metadata?.slug ?? (doc.metadata?.id ?? null),
    name: doc.metadata?.name ?? doc.pageContent?.slice(0, 60) ?? "",
    image: doc.metadata?.image ?? null,
    price: Number(doc.metadata?.price) || 0,
    category: doc.metadata?.category ?? null,
    description: doc.metadata?.description ?? null,
    featured: !!doc.metadata?.featured,
  }));

  return {
    answer: state.answer,
    products,
    showProducts: state.showProducts,
    followUpRequired: state.followUpRequired,
  };

}
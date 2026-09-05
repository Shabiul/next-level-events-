import { retrieverService } from "../retriever/retriever.service";

export class RetrieveHandler {

  async handle(message: string) {

    const docs = await retrieverService.retrieve(message);

    console.log("Documents received by router:", docs.length);
    if (docs.length === 0) {
      console.log("No documents found. Returning fallback response.");
    } else {
      console.log("Routing to recommendation/product handler.");
    }

    const products = docs
      .filter(doc => doc.metadata.collection === "products")
      .map(doc => ({
        id: doc.metadata.id,
        slug: doc.metadata.slug ?? doc.metadata.id,
        name: doc.metadata.name,
        image: doc.metadata.image,
        price: Number(doc.metadata.price) || 0,
        description: doc.metadata.description ?? "",
      }));

    if (products.length === 0) {
      return {
        answer:
          "I couldn't find an exact match, but you can browse our available decoration packages.",
        products: [],
      };
    }

    return {
      answer: `I found ${products.length} matching decoration package(s). 👇`,
      products,
    };
  }
}

export const retrieveHandler = new RetrieveHandler();
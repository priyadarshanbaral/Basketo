import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, stepCountIs, tool, type UIMessage } from "ai";
import { z } from "zod";

const USD_TO_INR = 84;

type DummyProduct = {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  stock: number;
  category: string;
  thumbnail: string;
};

async function dummyFetch(path: string) {
  const res = await fetch(`https://dummyjson.com${path}`);
  if (!res.ok) throw new Error(`DummyJSON ${res.status}`);
  return res.json();
}

function compact(p: DummyProduct) {
  return {
    id: p.id,
    name: p.title,
    price_inr: Math.round(p.price * USD_TO_INR),
    rating: p.rating,
    stock: p.stock,
    category: p.category,
    slug: `${p.id}-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  };
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(body.messages)) {
          return new Response("Messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);

        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: `You are Basketo's shopping assistant for an Indian online grocery & lifestyle store. Prices are in INR (₹).
- Use the search_products tool to find products by keyword. Results are NOT paginated — every matching product is returned.
- Use list_category to browse a whole category.
- Always link products as /product/{slug}.
- Be concise, friendly, format with markdown. Show prices like ₹1,299.`,
          messages: await convertToModelMessages(body.messages),
          stopWhen: stepCountIs(50),
          tools: {
            search_products: tool({
              description:
                "Search the full product catalog by keyword. Returns ALL matches (no limit).",
              inputSchema: z.object({
                query: z.string().describe("Search keyword, e.g. 'phone', 'lipstick'"),
              }),
              execute: async ({ query }) => {
                const data = await dummyFetch(
                  `/products/search?q=${encodeURIComponent(query)}&limit=0`,
                );
                const products = (data.products as DummyProduct[]).map(compact);
                return { count: products.length, products };
              },
            }),
            list_category: tool({
              description:
                "List every product in a category (no limit). Use list_categories first if unsure.",
              inputSchema: z.object({
                category: z.string().describe("Category slug, e.g. 'groceries', 'beauty'"),
              }),
              execute: async ({ category }) => {
                const data = await dummyFetch(
                  `/products/category/${encodeURIComponent(category)}?limit=0`,
                );
                const products = (data.products as DummyProduct[]).map(compact);
                return { count: products.length, products };
              },
            }),
            list_categories: tool({
              description: "List all available product category slugs.",
              inputSchema: z.object({}),
              execute: async () => {
                const data = await dummyFetch(`/products/category-list`);
                return { categories: data as string[] };
              },
            }),
            get_product: tool({
              description: "Get full details for one product by its numeric id.",
              inputSchema: z.object({ id: z.number() }),
              execute: async ({ id }) => {
                const p = (await dummyFetch(`/products/${id}`)) as DummyProduct;
                return {
                  ...compact(p),
                  description: p.description,
                  thumbnail: p.thumbnail,
                };
              },
            }),
          },
        });

        return result.toUIMessageStreamResponse({
          originalMessages: body.messages,
        });
      },
    },
  },
});

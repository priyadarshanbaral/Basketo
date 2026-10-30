import { createFileRoute, Link, notFound, type ErrorComponentProps } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { getPage } from "@/lib/pages.functions";
import { ArrowLeft } from "lucide-react";

const pageQO = (slug: string) =>
  queryOptions({
    queryKey: ["page", slug],
    queryFn: () => getPage({ data: { slug } }),
  });

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(pageQO(params.slug));
    if (!p) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Basketo` },
      {
        name: "description",
        content: "Basketo — farm-fresh groceries delivered.",
      },
    ],
  }),
  errorComponent: ({ error }: ErrorComponentProps) => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">
          {error instanceof Error ? error.message : String(error)}
        </p>
        <Link to="/" className="mt-4 inline-block text-primary">
          ← Back home
        </Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl font-bold">Page not found</h1>
        <Link to="/" className="mt-4 inline-block text-primary">
          ← Back home
        </Link>
      </div>
    </div>
  ),
  component: ContentPage,
});

function ContentPage() {
  const { slug } = Route.useParams();
  const { data: page } = useSuspenseQuery(pageQO(slug));
  if (!page) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 font-display text-4xl font-bold md:text-5xl"
        >
          {page.title}
        </motion.h1>
        {page.subtitle && <p className="mt-3 text-lg text-muted-foreground">{page.subtitle}</p>}

        <div className="mt-10 space-y-8">
          {page.sections.map((s, i) => (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-3xl border border-border bg-card p-6 md:p-8"
            >
              <h2 className="font-display text-xl font-bold md:text-2xl">{s.heading}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </motion.section>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

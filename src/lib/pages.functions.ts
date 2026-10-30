import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PageSection = { heading: string; body: string };
export type SitePage = {
  slug: string;
  title: string;
  subtitle: string | null;
  sections: PageSection[];
  group_name: string;
  sort_order: number;
};

function publicClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const getPage = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }): Promise<SitePage | null> => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("pages")
      .select("slug,title,subtitle,sections,group_name,sort_order")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    return { ...row, sections: (row.sections as PageSection[]) ?? [] };
  });

export const listPages = createServerFn({ method: "GET" }).handler(
  async (): Promise<SitePage[]> => {
    const supabase = publicClient();
    const { data, error } = await supabase
      .from("pages")
      .select("slug,title,subtitle,sections,group_name,sort_order")
      .order("group_name")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      ...r,
      sections: (r.sections as PageSection[]) ?? [],
    }));
  },
);

import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { Router, type IRouter } from "express";
import sanitizeHtml from "sanitize-html";
import { db, blogPostsTable } from "@workspace/db";
import {
  CreateAdminPostBody,
  CreateAdminPostResponse,
  DeleteAdminPostParams,
  GetAdminPostParams,
  GetAdminPostResponse,
  GetAdminSummaryResponse,
  GetFeaturedPostResponse,
  GetPublishedPostParams,
  GetPublishedPostResponse,
  ListAdminPostsQueryParams,
  ListAdminPostsResponse,
  ListPublishedPostsQueryParams,
  ListPublishedPostsResponse,
  UpdateAdminPostBody,
  UpdateAdminPostParams,
  UpdateAdminPostResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

const richTextSanitizer = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    "h1",
    "h2",
    "h3",
    "img",
    "figure",
    "figcaption",
    "u",
    "hr",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer",
    }),
  },
};

function sanitizeImageUrl(value: string | null | undefined): string | null {
  if (value == null || value.trim() === "") return null;
  const trimmed = value.trim();

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol === "https:" || url.protocol === "http:") return trimmed;
  } catch {
    // The invalid URL is rejected below.
  }

  throw new Error("Cover image must be an HTTP or HTTPS URL");
}

function slugBase(title: string): string {
  const slug = title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "story";
}

async function uniqueSlug(title: string, excludeId?: number): Promise<string> {
  const base = slugBase(title);
  let slug = base;
  let suffix = 2;

  while (true) {
    const [existing] = await db
      .select({ id: blogPostsTable.id })
      .from(blogPostsTable)
      .where(eq(blogPostsTable.slug, slug))
      .limit(1);

    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

function cleanBody(contentHtml: string): string {
  return sanitizeHtml(contentHtml, richTextSanitizer);
}

function imageUrlOrBadRequest(
  value: string | null | undefined,
  res: Parameters<import("express").RequestHandler>[1],
): string | null | undefined {
  try {
    return value === undefined ? undefined : sanitizeImageUrl(value);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Invalid cover image URL",
    });
    return undefined;
  }
}

router.get("/posts", async (req, res): Promise<void> => {
  const query = ListPublishedPostsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const posts = await db
    .select()
    .from(blogPostsTable)
    .where(eq(blogPostsTable.status, "published"))
    .orderBy(desc(blogPostsTable.publishedAt), desc(blogPostsTable.createdAt))
    .limit(query.data.limit);

  res.json(ListPublishedPostsResponse.parse(posts));
});

router.get("/posts/featured", async (_req, res): Promise<void> => {
  const [post] = await db
    .select()
    .from(blogPostsTable)
    .where(
      and(
        eq(blogPostsTable.status, "published"),
        eq(blogPostsTable.featured, true),
      ),
    )
    .orderBy(desc(blogPostsTable.publishedAt))
    .limit(1);

  if (!post) {
    res.status(404).json({ error: "No featured post is published" });
    return;
  }

  res.json(GetFeaturedPostResponse.parse(post));
});

router.get("/posts/:slug", async (req, res): Promise<void> => {
  const params = GetPublishedPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [post] = await db
    .select()
    .from(blogPostsTable)
    .where(
      and(
        eq(blogPostsTable.slug, params.data.slug),
        eq(blogPostsTable.status, "published"),
      ),
    )
    .limit(1);

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(GetPublishedPostResponse.parse(post));
});

router.get("/admin/summary", requireAdmin, async (_req, res): Promise<void> => {
  const [totals] = await db
    .select({ total: count() })
    .from(blogPostsTable);
  const grouped = await db
    .select({ status: blogPostsTable.status, total: count() })
    .from(blogPostsTable)
    .groupBy(blogPostsTable.status);
  const recentPosts = await db
    .select()
    .from(blogPostsTable)
    .orderBy(desc(blogPostsTable.updatedAt))
    .limit(5);

  const summary = {
    totalPosts: totals?.total ?? 0,
    publishedPosts:
      grouped.find((row) => row.status === "published")?.total ?? 0,
    draftPosts: grouped.find((row) => row.status === "draft")?.total ?? 0,
    recentPosts,
  };

  res.json(GetAdminSummaryResponse.parse(summary));
});

router.get("/admin/posts", requireAdmin, async (req, res): Promise<void> => {
  const query = ListAdminPostsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const filters: SQL[] = [];
  if (query.data.status !== "all") {
    filters.push(eq(blogPostsTable.status, query.data.status));
  }
  const search = query.data.q?.trim();
  if (search) {
    const searchFilter = or(
      ilike(blogPostsTable.title, `%${search}%`),
      ilike(blogPostsTable.excerpt, `%${search}%`),
    );
    if (searchFilter) filters.push(searchFilter);
  }

  const posts = await db
    .select()
    .from(blogPostsTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(blogPostsTable.updatedAt));

  res.json(ListAdminPostsResponse.parse(posts));
});

router.post("/admin/posts", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAdminPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const imageUrl = imageUrlOrBadRequest(parsed.data.coverImageUrl, res);
  if (parsed.data.coverImageUrl !== undefined && imageUrl === undefined) return;

  if (parsed.data.featured && parsed.data.status === "published") {
    await db
      .update(blogPostsTable)
      .set({ featured: false })
      .where(
        and(
          eq(blogPostsTable.status, "published"),
          eq(blogPostsTable.featured, true),
        ),
      );
  }

  const now = new Date();
  const [post] = await db
    .insert(blogPostsTable)
    .values({
      title: parsed.data.title.trim(),
      slug: await uniqueSlug(parsed.data.title),
      excerpt: parsed.data.excerpt.trim(),
      contentHtml: cleanBody(parsed.data.contentHtml),
      coverImageUrl: imageUrl ?? null,
      category: parsed.data.category.trim(),
      author: parsed.data.author.trim(),
      status: parsed.data.status,
      featured: parsed.data.featured,
      publishedAt: parsed.data.status === "published" ? now : null,
    })
    .returning();

  res.status(201).json(CreateAdminPostResponse.parse(post));
});

router.get(
  "/admin/posts/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = GetAdminPostParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [post] = await db
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, params.data.id))
      .limit(1);

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    res.json(GetAdminPostResponse.parse(post));
  },
);

router.patch(
  "/admin/posts/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = UpdateAdminPostParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = UpdateAdminPostBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [existing] = await db
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, params.data.id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const imageUrl = imageUrlOrBadRequest(parsed.data.coverImageUrl, res);
    if (parsed.data.coverImageUrl !== undefined && imageUrl === undefined) return;

    const nextStatus = parsed.data.status ?? existing.status;
    const nextFeatured = parsed.data.featured ?? existing.featured;
    if (nextFeatured && nextStatus === "published") {
      await db
        .update(blogPostsTable)
        .set({ featured: false })
        .where(
          and(
            eq(blogPostsTable.status, "published"),
            eq(blogPostsTable.featured, true),
          ),
        );
    }

    const updatedAt = new Date();
    const [post] = await db
      .update(blogPostsTable)
      .set({
        ...(parsed.data.title !== undefined && {
          title: parsed.data.title.trim(),
        }),
        ...(parsed.data.excerpt !== undefined && {
          excerpt: parsed.data.excerpt.trim(),
        }),
        ...(parsed.data.contentHtml !== undefined && {
          contentHtml: cleanBody(parsed.data.contentHtml),
        }),
        ...(parsed.data.coverImageUrl !== undefined && {
          coverImageUrl: imageUrl ?? null,
        }),
        ...(parsed.data.category !== undefined && {
          category: parsed.data.category.trim(),
        }),
        ...(parsed.data.author !== undefined && {
          author: parsed.data.author.trim(),
        }),
        ...(parsed.data.status !== undefined && { status: nextStatus }),
        ...(parsed.data.featured !== undefined && { featured: nextFeatured }),
        publishedAt:
          nextStatus === "draft"
            ? null
            : existing.publishedAt ?? updatedAt,
        updatedAt,
      })
      .where(eq(blogPostsTable.id, params.data.id))
      .returning();

    res.json(UpdateAdminPostResponse.parse(post));
  },
);

router.delete(
  "/admin/posts/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = DeleteAdminPostParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [deleted] = await db
      .delete(blogPostsTable)
      .where(eq(blogPostsTable.id, params.data.id))
      .returning({ id: blogPostsTable.id });

    if (!deleted) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;

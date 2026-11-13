import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const postStatusEnum = pgEnum("post_status", ["draft", "published"]);

export const blogPostsTable = pgTable(
  "blog_posts",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    contentHtml: text("content_html").notNull().default(""),
    coverImageUrl: text("cover_image_url"),
    category: text("category").notNull().default("Founder Stories"),
    author: text("author").notNull().default("Crush Editorial"),
    status: postStatusEnum("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("blog_posts_slug_unique").on(table.slug)],
);

export const insertBlogPostSchema = createInsertSchema(blogPostsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const blogPostUpdateSchema = insertBlogPostSchema
  .partial()
  .omit({ slug: true, publishedAt: true });

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPostUpdate = z.infer<typeof blogPostUpdateSchema>;
export type BlogPost = typeof blogPostsTable.$inferSelect;

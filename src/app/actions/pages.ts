"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";

const prisma = new PrismaClient();

export async function createPage(formData: FormData) {
  const session = await auth();
  const user = session?.user as any;

  if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    throw new Error("Unauthorized: Only admins and managers can create pages.");
  }

  const title = formData.get("title") as string;
  const parentId = formData.get("parentId") as string | null;

  if (!title) {
    throw new Error("Title is required.");
  }

  // Generate a unique slug
  let baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.page.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const newPage = await prisma.page.create({
    data: {
      title,
      slug,
      content: "", // Start empty
      authorId: user.id || "",
      parentId: parentId || null,
    },
  });

  revalidatePath("/docs");
  revalidatePath(`/docs/${newPage.slug}`);
  redirect(`/docs/${newPage.slug}`);
}

export async function updatePageContent(pageId: string, title: string, content: string) {
  const session = await auth();
  const user = session?.user as any;

  if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    throw new Error("Unauthorized: Only admins and managers can edit pages.");
  }

  const page = await prisma.page.update({
    where: { id: pageId },
    data: { 
        title: title,
        content: content 
    },
  });

  revalidatePath("/docs");
  revalidatePath(`/docs/${page.slug}`);
}

export async function deletePage(pageId: string) {
  const session = await auth();
  const user = session?.user as any;

  if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    throw new Error("Unauthorized: Only admins and managers can delete pages.");
  }

  await prisma.page.delete({
    where: { id: pageId },
  });

  revalidatePath("/docs");
  revalidatePath("/docs/[slug]", "page");
}

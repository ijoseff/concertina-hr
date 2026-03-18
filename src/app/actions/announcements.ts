"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createAnnouncement(formData: FormData) {
  const session = await auth();
  
  const user = session?.user as any;
  if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    throw new Error("Unauthorized: Only admins and managers can post announcements.");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content) {
    throw new Error("Title and content are required.");
  }

  await prisma.announcement.create({
    data: {
      title,
      content,
      authorId: user.id || "",
    },
  });

  revalidatePath("/");
  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
}

export async function deleteAnnouncement(announcementId: string) {
  const session = await auth();
  
  const user = session?.user as any;
  if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    throw new Error("Unauthorized: Only admins and managers can delete announcements.");
  }

  await prisma.announcement.delete({
    where: {
      id: announcementId,
    },
  });

  revalidatePath("/");
  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
}

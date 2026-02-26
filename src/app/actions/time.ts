"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth"; // import the auth module

const prisma = new PrismaClient();

export async function toggleClockStatus() {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return { success: false, error: "Not authenticated" };
        }

        const employeeId = session.user.id;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // 1. Check if the user has an active (open) time log for today
        const activeLog = await prisma.timeLog.findFirst({
            where: {
                userId: employeeId,
                clockOut: null,
            },
            orderBy: {
                clockIn: "desc",
            },
        });

        if (activeLog) {
            // User is currently clocked in. So we clock them out.
            await prisma.timeLog.update({
                where: { id: activeLog.id },
                data: { clockOut: new Date() },
            });
        } else {
            // User is not clocked in. We create a new clock in record.
            const now = new Date();

            // Basic late logic (e.g., standard start time 9:00 AM)
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
            const isLate = now > startOfDay;

            await prisma.timeLog.create({
                data: {
                    userId: employeeId,
                    clockIn: now,
                    status: isLate ? "LATE" : "ON_TIME",
                },
            });
        }

        // Refresh the dashboard data
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Error toggling clock status:", error);
        return { success: false, error: "Failed to update time log" };
    }
}

export async function getClockStatus() {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return { isClockedIn: false, clockInTime: null };
        }

        const employeeId = session.user.id;

        const activeLog = await prisma.timeLog.findFirst({
            where: {
                userId: employeeId,
                clockOut: null,
            },
            orderBy: {
                clockIn: "desc",
            },
        });

        return {
            isClockedIn: !!activeLog,
            clockInTime: activeLog?.clockIn || null
        };
    } catch (error) {
        console.error("Error getting clock status:", error);
        return { isClockedIn: false, clockInTime: null };
    }
}

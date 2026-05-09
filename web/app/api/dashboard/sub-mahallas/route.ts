import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.mainMahallaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mainMahalla = await prisma.mainMahalla.findUnique({
    where: { id: session.user.mainMahallaId },
    select: { district: true, province: true, area: true }
  });

  const subMahallas = await prisma.subMahalla.findMany({
    where: { mainMahallaId: session.user.mainMahallaId },
    include: {
      familyCards: {
        select: {
          _count: {
            select: { members: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const subMahallasWithCount = subMahallas.map(sm => ({
    ...sm,
    memberCount: sm.familyCards.reduce((acc, fc) => acc + fc._count.members, 0)
  }));

  let subAreas: any[] = [];
  if (mainMahalla?.area) {
    // Find the city (MasterArea) to get its sub-areas
    const area = await prisma.masterArea.findFirst({
      where: { 
        name: { equals: mainMahalla.area, mode: 'insensitive' }
      }
    });

    if (area) {
      subAreas = await prisma.masterSubArea.findMany({
        where: { areaId: area.id },
        orderBy: { name: 'asc' }
      });
    }
  }

  return NextResponse.json({ subMahallas: subMahallasWithCount, subAreas });
}

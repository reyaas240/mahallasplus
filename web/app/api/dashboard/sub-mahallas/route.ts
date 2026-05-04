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
    select: { district: true, province: true }
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

  let areas: any[] = [];
  if (mainMahalla?.district) {
    // Find the district in master data, matching province if available
    const district = await prisma.masterDistrict.findFirst({
      where: { 
        name: { equals: mainMahalla.district, mode: 'insensitive' },
        ...(mainMahalla.province && {
          province: { name: { equals: mainMahalla.province, mode: 'insensitive' } }
        })
      }
    });

    if (district) {
      areas = await prisma.masterArea.findMany({
        where: { districtId: district.id },
        orderBy: { name: 'asc' }
      });
    }
  }

  return NextResponse.json({ subMahallas: subMahallasWithCount, areas });
}

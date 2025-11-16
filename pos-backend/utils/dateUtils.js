import prisma from "../config/prismaConfig.js";

export async function formatWithOutletTimezone(date, outletId) {
  const outlet = await prisma.outlets.findUnique({ where: { id: outletId }});

  const timezone = outlet?.timezone || "Asia/Makassar";

  return new Date(date).toLocaleString("id-ID", {
    timeZone: timezone,
    hour12: false,
  });
}

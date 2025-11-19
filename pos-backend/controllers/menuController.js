import prisma from "../config/prismaConfig.js";
import createHttpError from "http-errors";

export const getMenuCategoriesWithItems = async (req, res) => {
  try {
    const categories = await prisma.menu_categories.findMany({
      where: { isActive: true },
      include: {
        menuItems: {
          where: { isAvailable: true },
          select: {
            id: true,
            name: true,
            basePrice: true,
            imageUrl: true,
          }
        }
      }
    });

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error("🔥 MENU QUERY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Menu fetch failed"
    });
  }
};


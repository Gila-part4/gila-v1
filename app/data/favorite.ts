import { Favorite } from "@prisma/client";
import { getCurrentUserId } from "@/app/data/user";
import { db } from "@/lib/db";

export const getMyFavorites = async (): Promise<{ favorites: Favorite[], cursorId: string | null }> => {
  try {
    const userId = await getCurrentUserId();

    const favorites = await db.favorite.findMany({
      where: { userId },
      include: {
        activity: true,  
      },
      take: 10,
      orderBy: {
        createdAt: 'asc',  
      },
    });

    const lastFavorite = favorites[favorites.length - 1];
    const cursorId = lastFavorite ? lastFavorite.id : null;

    return { favorites, cursorId };
  } catch (error) {
    throw new Error('좋아요 목록을 가져오는 중에 에러가 발생하였습니다.');
  }
};
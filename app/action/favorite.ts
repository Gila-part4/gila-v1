'use server'

import { getCurrentUserId } from '@/app/data/user'
import { db } from '@/lib/db'
import { ActionType } from '@/type'
import { Favorite } from '@prisma/client'

export const toggleFavorite = async (
  activityId: string,
): Promise<ActionType<Favorite>> => {
  try {
    const userId = await getCurrentUserId()

    const existingFavorite = await db.favorite.findFirst({
      where: {
        activityId,
        userId,
      },
    })

    if (existingFavorite) {
      await db.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      })

      return { success: true, message: '즐겨찾기에서 삭제되었습니다.' }
    } else {
      const newFavorite = await db.favorite.create({
        data: {
          userId,
          activityId,
        },
      })

      if (!newFavorite)
        return { success: false, message: '즐겨찾기 추가에 실패하였습니다.' }

      return {
        success: true,
        message: '즐겨찾기에 추가되었습니다.',
        data: newFavorite,
      }
    }
  } catch (error) {
    return {
      success: false,
      message: '즐겨찾기 토글 중에 에러가 발생하였습니다.',
    }
  }
}

export const loadMoreFavorites = async (cursorId: string | null): Promise<{ favorites: Favorite[], cursorId: string | null }> => {
  try {
    const userId = await getCurrentUserId();

    const favorites = await db.favorite.findMany({
      where: { userId },
      include: {
        activity: true, 
      },
      take: 10,
      ...(cursorId && {
        cursor: {
          id: cursorId,
        },
        skip: 1,
      }),
      orderBy: {
        createdAt: 'asc',  
      },
    });

    const lastFavorite = favorites[favorites.length - 1];
    const newCursorId = lastFavorite ? lastFavorite.id : null;

    return { favorites, cursorId: newCursorId };
  } catch (error) {
    throw new Error('좋아요 목록을 더 가져오는 중에 에러가 발생하였습니다.');
  }
};
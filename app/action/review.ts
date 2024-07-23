'use server'

import { db } from '@/lib/db'
import { ActionType } from '@/type'
import { Review } from '@prisma/client'
import { getCurrentUserId } from '@/app/data/user'

// score limit 100
export const createReview = async ({
  userId,
  activityId,
  rating,
}: {
  userId: string
  activityId: string
  rating: number
}): Promise<ActionType<Review>> => {
  if (rating > 100) {
    return { success: false, message: '점수는 100을 초과할 수 없습니다.' }
  }

  try {
    const newReview = await db.review.create({
      data: {
        userId,
        rating,
        activityId,
      },
    })

    if (!newReview)
      return { success: false, message: '리뷰 생성에 실패하였습니다.' }

    return {
      success: true,
      message: '리뷰 생성에 성공하였습니다.',
      data: newReview,
    }
  } catch (error) {
    return { success: false, message: '리뷰 생성 중에 에러가 발생하였습니다.' }
  }
}

export const loadMoreAvailableReviews = async (cursorId: string | null): Promise<{ reviews: Review[], cursorId: string | null }> => {
  try {
    const userId = await getCurrentUserId();
    const currentDate = new Date();

    const activities = await db.activity.findMany({
      where: {
        endDate: {
          lt: currentDate,
        },
        activityRequests: {
          some: {
            requestUserId: userId,
            status: 'APPROVE',
          },
        },
      },
      include: {
        reviews: true,
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

    const availableReviews = activities.flatMap((activity) => activity.reviews);

    const lastReview = availableReviews[availableReviews.length - 1];
    const newCursorId = lastReview ? lastReview.id : null;

    return { reviews: availableReviews, cursorId: newCursorId };
  } catch (error) {
    throw new Error('리뷰를 더 가져오는 중에 에러가 발생하였습니다.');
  }
};
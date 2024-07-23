// 현재 유저가 activity의 신청이 승인되고 activity의 endDate가 지나면 조건

import { getCurrentUserId } from '@/app/data/user'
import { db } from '@/lib/db'
import { Review } from '@prisma/client'

export const getAvailableReviews = async (): Promise<{ reviews: Review[], cursorId: string | null }> => {
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    const availableReviews = activities.flatMap((activity) => activity.reviews);

    const lastReview = availableReviews[availableReviews.length - 1];
    const cursorId = lastReview ? lastReview.id : null;

    return { reviews: availableReviews, cursorId };
  } catch (error) {
    throw new Error('리뷰를 가져오는 중에 에러가 발생하였습니다.');
  }
};
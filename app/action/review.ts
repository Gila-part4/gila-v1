'use server'

import { db } from '@/lib/db'
import { ActionType } from '@/type'
import { Review } from '@prisma/client'

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

'use server'

import { db } from '@/lib/db'
import { ActionType } from '@/type'
import { Activity } from '@prisma/client'
import { getCurrentUserId } from '../data/user'

export const createActivity = async ({
  title,
  description,
  thumbnails,
  tags,
  startDate,
  endDate,
  locations,
  maximumCount,
}: {
  title: string
  description: string
  thumbnails: string[]
  tags: string[]
  startDate: Date
  endDate: Date
  locations: string[]
  maximumCount: number
}): Promise<ActionType<Activity>> => {
  try {
    const userId = await getCurrentUserId()

    const newActivity = await db.activity.create({
      data: {
        userId,
        title,
        description,
        startDate,
        endDate,
        maximumCount,
        thumbnails,
        tags,
        locations,
      },
    })

    if (!newActivity)
      return { success: false, message: '활동 생성에 실패하였습니다.' }

    return {
      success: true,
      message: '활동 생성에 성공하였습니다.',
      data: newActivity,
    }
  } catch (error) {
    return { success: false, message: '활동 생성 중에 에러가 발생하였습니다.' }
  }
}

export const editActivity = async ({
  activityId,
  title,
  description,
  thumbnails,
  tags,
  startDate,
  endDate,
  locations,
  maximumCount,
}: {
  activityId: string
  title: string
  description: string
  thumbnails: string[]
  tags: string[]
  startDate: Date
  endDate: Date
  locations: string[]
  maximumCount: number
}): Promise<ActionType<Activity>> => {
  try {
    const userId = await getCurrentUserId()

    const updatedActivity = await db.activity.update({
      where: { id: activityId },
      data: {
        userId,
        title,
        description,
        startDate,
        endDate,
        maximumCount,
        thumbnails,
        tags,
        locations,
      },
    })

    if (!updatedActivity)
      return { success: false, message: '활동 수정에 실패하였습니다.' }

    return {
      success: true,
      message: '활동 수정에 성공하였습니다.',
      data: updatedActivity,
    }
  } catch (error) {
    return { success: false, message: '활동 수정 중에 에러가 발생하였습니다.' }
  }
}
export const deleteActivity = async (
  activityId: string,
): Promise<ActionType<Activity>> => {
  try {
    const deletedActivity = await db.activity.delete({
      where: { id: activityId },
    })

    if (!deletedActivity)
      return { success: false, message: '활동 삭제에 실패하였습니다.' }

    return { success: true, message: '활동 삭제에 성공하였습니다.' }
  } catch (error) {
    return { success: false, message: '활동 삭제 중에 에러가 발생하였습니다.' }
  }
}

export const loadMoreActivities = () => {}
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


export const loadMoreActivities = async ({ type, location, cursorId, size = 10 }: {
  type: 'recent' | 'popular' | 'related' | 'mostViewed' | 'recentByLocation' | 'popularByLocation' | 'relatedByLocation' | 'mostViewedByLocation';
  location?: string;
  cursorId?: string | null;
  size?: number;
}): Promise<{ activities: Activity[], cursorId: string | null }> => {
  try {
    const userId = await getCurrentUserId();
    let currentUser;
    if (type === 'related' || type.includes('relatedByLocation')) {
      currentUser = await db.user.findUnique({
        where: { id: userId },
        select: { tags: true },
      });

      if (!currentUser) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }
    }

    const whereClause = location ? { locations: { has: location } } : {};
    let orderByClause;
    let includeClause = {};

    switch (type) {
      case 'recent':
      case 'recentByLocation':
        orderByClause = { createdAt: 'desc' as const };
        break;
      case 'popular':
      case 'popularByLocation':
        orderByClause = { createdAt: 'asc' as const };
        includeClause = {
          _count: {
            select: { likes: true },
          },
        };
        break;
      case 'related':
      case 'relatedByLocation':
        orderByClause = { id: 'asc' as const };
        break;
      case 'mostViewed':
      case 'mostViewedByLocation':
        orderByClause = { views: 'desc' as const };
        break;
      default:
        throw new Error('유효하지 않은 정렬 조건입니다.');
    }

    const activities = await db.activity.findMany({
      where: whereClause,
      include: {
        ...includeClause,
        user: true,
        activityRequests: true,
      },
      take: size,
      ...(cursorId && {
        cursor: {
          id: cursorId,
        },
        skip: 1,
      }),
      orderBy: orderByClause,
    });

    let finalActivities = activities;

    if (type === 'popular' || type === 'popularByLocation') {
      const scoredActivities = activities.map((activity) => ({
        ...activity,
        score: activity.views ,
      }));

      finalActivities = scoredActivities.sort((a, b) => b.score - a.score).slice(0, size);
    }

    if ((type === 'related' || type === 'relatedByLocation') && currentUser) {
      const userTags = currentUser.tags;
      const scoredActivities = activities.map((activity) => {
        const matchingTagsCount = activity.tags.filter((tag) => userTags.includes(tag)).length;
        return {
          ...activity,
          matchingScore: matchingTagsCount,
        };
      });

      finalActivities = scoredActivities.sort((a, b) => b.matchingScore - a.matchingScore).slice(0, size);
    }

    const lastActivity = finalActivities[finalActivities.length - 1];
    const newCursorId = lastActivity ? lastActivity.id : null;

    return { activities: finalActivities, cursorId: newCursorId };
  } catch (error) {
    throw new Error('활동을 더 가져오는 중에 에러가 발생하였습니다.');
  }
};

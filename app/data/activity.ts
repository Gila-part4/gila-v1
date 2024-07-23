import { Activity } from '@prisma/client'
import { getCurrentUserId } from '@/app/data/user'
import { db } from '@/lib/db'

export const getMyActivities = async (): Promise<{ activities: Activity[], cursorId: string | null }> => {
  try {
    const userId = await getCurrentUserId();

    const myActivities = await db.activity.findMany({
      where: { userId },
      take: 10,
      orderBy: {
        id: 'asc',
      },
    });

    const lastActivity = myActivities[myActivities.length - 1];
    const cursorId = lastActivity ? lastActivity.id : null;

    return { activities: myActivities, cursorId };
  } catch (error) {
    throw new Error('활동을 가져오는 중에 에러가 발생하였습니다.');
  }
}


export const getActivities = async ({ type, location, cursorId, size = 10 }: {
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
    throw new Error('활동을 가져오는 중에 에러가 발생하였습니다.');
  }
};


export const getActivityById = async (id: string): Promise<Activity | null> => {
  try {
    const activity = await db.activity.findUnique({
      where: { id },
    })

    if (!activity) {
      throw new Error('활동을 찾을 수 없습니다.')
    }

    return activity
  } catch (error) {
    throw new Error('활동을 가져오는 중에 에러가 발생하였습니다.')
  }
}

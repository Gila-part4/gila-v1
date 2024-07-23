'use server'

import { db } from '@/lib/db'
import { ActionType, ActivityRequestWithActivity } from '@/type'
import { ActivityRequest } from '@prisma/client'
import { getCurrentUserId } from '../data/user'

export const createActivityRequest = async (
  activityId: string,
): Promise<ActionType<ActivityRequest>> => {
  try {
    const userId = await getCurrentUserId()

    const activityRequest = await db.activityRequest.create({
      data: {
        requestUserId: userId,
        activityId,
      },
    })

    if (!activityRequest)
      return { success: false, message: '요청 생성에 실패하였습니다.' }

    return { success: true, message: '요청 생성에 성공하였습니다.' }
  } catch (error) {
    return { success: false, message: '요청 생성중에 에러가 발생하였습니다.' }
  }
}

export const approveActivityRequest = async (
  requestId: string,
): Promise<ActionType<ActivityRequest>> => {
  try {
    const activityRequest = await db.activityRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVE' },
    })

    if (!activityRequest)
      return { success: false, message: '요청 승인에 실패하였습니다.' }

    return { success: true, message: '요청 승인에 성공하였습니다.' }
  } catch (error) {
    return { success: false, message: '요청 승인 중에 에러가 발생하였습니다.' }
  }
}

export const rejectActivityRequest = async (
  requestId: string,
): Promise<ActionType<ActivityRequest>> => {
  try {
    const activityRequest = await db.activityRequest.update({
      where: { id: requestId },
      data: { status: 'REJECT' },
    })

    if (!activityRequest)
      return { success: false, message: '요청 거절에 실패하였습니다.' }

    return { success: true, message: '요청 거절에 성공하였습니다.' }
  } catch (error) {
    return { success: false, message: '요청 거절 중에 에러가 발생하였습니다.' }
  }
}

export const deleteActivityRequest = async (
  requestId: string,
): Promise<ActionType<ActivityRequest>> => {
  try {
    const activityRequest = await db.activityRequest.delete({
      where: { id: requestId },
    })

    if (!activityRequest)
      return { success: false, message: '요청 삭제에 실패하였습니다.' }

    return { success: true, message: '요청 삭제에 성공하였습니다.' }
  } catch (error) {
    return { success: false, message: '요청 삭제 중에 에러가 발생하였습니다.' }
  }
}


export const loadMoreRegisteredActivities = async (cursorId: string | null = null): Promise<{ activities: ActivityRequest[], cursorId: string | null }> => {
  try {
    const userId = await getCurrentUserId();

    const registeredActivityRequests = await db.activityRequest.findMany({
      where: { requestUserId: userId },
      include: {
        activity: true,
      },
      take: 10,
      ...(cursorId && {
        cursor: {
          id: cursorId,
        },
        skip: 1, // cursor 항목 자체를 제외하고 이후 항목부터 가져옴
      }),
      orderBy: {
        id: 'asc',
      },
    });

    const lastActivityRequest = registeredActivityRequests[registeredActivityRequests.length - 1];
    const newCursorId = lastActivityRequest ? lastActivityRequest.id : null;

    return { activities: registeredActivityRequests, cursorId: newCursorId };
  } catch (error) {
    throw new Error('활동 요청을 가져오는 중에 에러가 발생하였습니다.');
  }
}

export const loadMoreRequestedActivities = async (cursorId: string | null): Promise<{ activities: ActivityRequestWithActivity[], cursorId: string | null }> => {
  try {
    const userId = await getCurrentUserId();

    const requestedActivities = await db.activityRequest.findMany({
      where: { requestUserId: userId },
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
        id: 'asc',
      },
    });

    const lastActivityRequest = requestedActivities[requestedActivities.length - 1];
    const newCursorId = lastActivityRequest ? lastActivityRequest.id : null;

    return { activities: requestedActivities, cursorId: newCursorId };
  } catch (error) {
    throw new Error('신청한 활동을 가져오는 중에 에러가 발생하였습니다.');
  }
}
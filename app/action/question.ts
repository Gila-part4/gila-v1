'use server'

import { ActionType } from '@/type'
import { Question } from '@prisma/client'
import { getCurrentUserId } from '@/app/data/user'
import { db } from '@/lib/db'

export const createQuestion = async ({
  title,
  content,
  location,
}: {
  title: string
  content: string
  location: string
}): Promise<ActionType<Question>> => {
  try {
    const userId = await getCurrentUserId()

    const question = await db.question.create({
      data: {
        userId,
        title,
        content,
        location,
      },
    })

    if (!question)
      return { success: false, message: '질문 요청 생성에 실패하였습니다.' }

    return {
      success: true,
      message: '질문 요청 생성에 성공하였습니다.',
      data: question,
    }
  } catch (error) {
    return {
      success: false,
      message: '질문 요청 생성 중에 에러가 발생하였습니다.',
    }
  }
}

export const editQuestion = async ({
  requestId,
  title,
  location,
}: {
  requestId: string
  title: string
  location: string
}): Promise<ActionType<Question>> => {
  try {
    const question = await db.question.update({
      where: { id: requestId },
      data: {
        title,
        location,
      },
    })

    if (!question)
      return { success: false, message: '질문 요청 수정에 실패하였습니다.' }

    return {
      success: true,
      message: '질문 요청 수정에 성공하였습니다.',
      data: question,
    }
  } catch (error) {
    return {
      success: false,
      message: '질문 요청 수정 중에 에러가 발생하였습니다.',
    }
  }
}

export const deleteQuestion = async (
  requestId: string,
): Promise<ActionType<Question>> => {
  try {
    const question = await db.question.delete({
      where: { id: requestId },
    })

    if (!question)
      return { success: false, message: '질문 요청 삭제에 실패하였습니다.' }

    return { success: true, message: '질문 요청 삭제에 성공하였습니다.' }
  } catch (error) {
    return {
      success: false,
      message: '질문 요청 삭제 중에 에러가 발생하였습니다.',
    }
  }
}

export const loadMoreQuestions = async ({ order, location, cursorId }: {
  order: 'answerLen' | 'recent';
  location?: string;
  cursorId?: string | null;
}): Promise<{ questions: Question[], cursorId: string | null }> => {
  try {
    const whereClause = location ? { location } : {};

    let orderByClause;

    switch (order) {
      case 'recent':
        orderByClause = { createdAt: 'desc' as const };
        break;
      case 'answerLen':
        orderByClause = { answers: { _count: 'desc' as const } };
        break;
      default:
        throw new Error('order 값이 잘못되었습니다');
    }

    const questions = await db.question.findMany({
      where: whereClause,
      include: {
        user: true,
        answers: true,
      },
      take: 10,
      ...(cursorId && {
        cursor: {
          id: cursorId,
        },
        skip: 1,
      }),
      orderBy: orderByClause,
    });

    const lastQuestion = questions[questions.length - 1];
    const newCursorId = lastQuestion ? lastQuestion.id : null;

    return { questions, cursorId: newCursorId };
  } catch (error) {
    throw new Error('질문을 더 가져오는 중에 에러가 발생하였습니다.');
  }
};

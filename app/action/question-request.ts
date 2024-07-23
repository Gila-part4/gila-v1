'use server'

import { ActionType } from '@/type'
import { QuestionRequest } from '@prisma/client'
import { getCurrentUserId } from '@/app/data/user'
import { db } from '@/lib/db'

export const createQuestionRequest = async ({
  title,
  content,
  location,
}: {
  title: string
  content: string
  location: string
}): Promise<ActionType<QuestionRequest>> => {
  try {
    const userId = await getCurrentUserId()

    const newQuestionRequest = await db.questionRequest.create({
      data: {
        userId,
        title,
        content,
        location,
      },
    })

    if (!newQuestionRequest)
      return { success: false, message: '질문 요청 생성에 실패하였습니다.' }

    return {
      success: true,
      message: '질문 요청 생성에 성공하였습니다.',
      data: newQuestionRequest,
    }
  } catch (error) {
    return {
      success: false,
      message: '질문 요청 생성 중에 에러가 발생하였습니다.',
    }
  }
}

export const editQuestionRequest = async ({
  requestId,
  title,
  location,
}: {
  requestId: string
  title: string
  location: string
}): Promise<ActionType<QuestionRequest>> => {
  try {
    const updatedQuestionRequest = await db.questionRequest.update({
      where: { id: requestId },
      data: {
        title,
        location,
      },
    })

    if (!updatedQuestionRequest)
      return { success: false, message: '질문 요청 수정에 실패하였습니다.' }

    return {
      success: true,
      message: '질문 요청 수정에 성공하였습니다.',
      data: updatedQuestionRequest,
    }
  } catch (error) {
    return {
      success: false,
      message: '질문 요청 수정 중에 에러가 발생하였습니다.',
    }
  }
}

export const deleteQuestionRequest = async (
  requestId: string,
): Promise<ActionType<QuestionRequest>> => {
  try {
    const deletedQuestionRequest = await db.questionRequest.delete({
      where: { id: requestId },
    })

    if (!deletedQuestionRequest)
      return { success: false, message: '질문 요청 삭제에 실패하였습니다.' }

    return { success: true, message: '질문 요청 삭제에 성공하였습니다.' }
  } catch (error) {
    return {
      success: false,
      message: '질문 요청 삭제 중에 에러가 발생하였습니다.',
    }
  }
}

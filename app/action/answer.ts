'use server'

import { ActionType } from '@/type'
import { Answer } from '@prisma/client'
import { getCurrentUserId } from '@/app/data/user'
import { db } from '@/lib/db'

export const createAnswer = async ({
  questionId,
  content,
  images,
}: {
  questionId: string
  content: string
  images: string[]
}): Promise<ActionType<Answer>> => {
  try {
    const userId = await getCurrentUserId()

    const newAnswer = await db.answer.create({
      data: {
        userId,
        questionId,
        content,
        images,
      },
    })

    if (!newAnswer)
      return { success: false, message: '답변 생성에 실패하였습니다.' }

    return {
      success: true,
      message: '답변 생성에 성공하였습니다.',
      data: newAnswer,
    }
  } catch (error) {
    return { success: false, message: '답변 생성 중에 에러가 발생하였습니다.' }
  }
}

export const editAnswer = async ({
  answerId,
  content,
  images,
}: {
  answerId: string
  content: string
  images: string[]
}): Promise<ActionType<Answer>> => {
  try {
    const updatedAnswer = await db.answer.update({
      where: { id: answerId },
      data: {
        content,
        images,
      },
    })

    if (!updatedAnswer)
      return { success: false, message: '답변 수정에 실패하였습니다.' }

    return {
      success: true,
      message: '답변 수정에 성공하였습니다.',
      data: updatedAnswer,
    }
  } catch (error) {
    return { success: false, message: '답변 수정 중에 에러가 발생하였습니다.' }
  }
}

export const deleteAnswer = async (
  answerId: string,
): Promise<ActionType<Answer>> => {
  try {
    const deletedAnswer = await db.answer.delete({
      where: { id: answerId },
    })

    if (!deletedAnswer)
      return { success: false, message: '답변 삭제에 실패하였습니다.' }

    return { success: true, message: '답변 삭제에 성공하였습니다.' }
  } catch (error) {
    return { success: false, message: '답변 삭제 중에 에러가 발생하였습니다.' }
  }
}

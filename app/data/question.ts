// 10개
// 스킵

import { db } from "@/lib/db";
import { Question } from "@prisma/client";


export const getQuestions = async ({ order, location, cursorId }: {
  order: 'answerLen' | 'recent';
  location?: string;
  cursorId?: string | null;
}): Promise<{ questions: Question[], cursorId: string | null }> => {
  try {
    const whereClause = location ? { location } : {};

    let orderByClause

    switch (order){
      case 'recent':
        orderByClause = {createdAt: 'desc' as const}
        break
      case 'answerLen':
        orderByClause = { answers: { _count: 'desc' as const } }
      default: 
        throw new Error('order값이 잘못 되었습니다')
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
      orderBy: orderByClause
    });

    const lastQuestion = questions[questions.length - 1];
    const newCursorId = lastQuestion ? lastQuestion.id : null;

    return { questions, cursorId: newCursorId };
  } catch (error) {
    throw new Error('질문 요청을 가져오는 중에 에러가 발생하였습니다.');
  }
};
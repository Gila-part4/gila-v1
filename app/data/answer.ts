import { db } from "@/lib/db";
import { Answer } from "@prisma/client";

export const getAnswers = async (questionId: string): Promise<{ answers: Answer[], cursorId: string | null }> => {
  try {
    const answers = await db.answer.findMany({
      where: { questionId },
      include: {
        user: true,  
      },
      take: 10,
      orderBy: {
        createdAt: 'asc', 
      },
    });

    const lastAnswer = answers[answers.length - 1];
    const cursorId = lastAnswer ? lastAnswer.id : null;

    return { answers, cursorId };
  } catch (error) {
    throw new Error('답변을 가져오는 중에 에러가 발생하였습니다.');
  }
};
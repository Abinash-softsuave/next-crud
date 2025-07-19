import { NextResponse } from "next/server";
import { query } from "@/lib/db";

interface Question {
  id: number;
  question: string;
  options: string | string[];
  correct_answer: string;
}

interface ClientQuestion {
  id: number;
  question: string;
  options: string[];
}

interface Result {
  questionId: number;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export async function GET() {
  try {
    const questions = (await query("SELECT * FROM questions")) as Question[];
    const clientQuestions: ClientQuestion[] = questions.map((q) => {
      let parsedOptions: string[];
      try {
        parsedOptions =
          typeof q.options === "string" ? JSON.parse(q.options) : q.options;
      } catch (error) {
        console.error(
          `Failed to parse options for question ${q.id}:`,
          q.options,
          error
        );
        parsedOptions = [];
      }
      return {
        id: q.id,
        question: q.question,
        options: parsedOptions,
      };
    });
    return NextResponse.json(clientQuestions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, userName, answers } = await request.json();
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    if (!userName) {
      return NextResponse.json(
        { error: "User name is required" },
        { status: 400 }
      );
    }
    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Answers must be an array" },
        { status: 400 }
      );
    }

    const questions = (await query("SELECT * FROM questions")) as Question[];
    if (answers.length !== questions.length) {
      return NextResponse.json(
        {
          error: `Expected ${questions.length} answers, received ${answers.length}`,
        },
        { status: 400 }
      );
    }

    const parsedQuestions = questions.map((q) => {
      let parsedOptions: string[];
      try {
        parsedOptions =
          typeof q.options === "string" ? JSON.parse(q.options) : q.options;
      } catch (error) {
        console.error(
          `Failed to parse options for question ${q.id}:`,
          q.options,
          error
        );
        parsedOptions = [];
      }
      return { ...q, options: parsedOptions };
    });

    let score = 0;
    const results: Result[] = answers.map((answer: string, index: number) => {
      const isCorrect = answer === parsedQuestions[index].correct_answer;
      if (isCorrect) score++;
      return {
        questionId: parsedQuestions[index].id,
        selectedAnswer: answer,
        correctAnswer: parsedQuestions[index].correct_answer,
        isCorrect,
      };
    });

    await query(
      "INSERT INTO results (user_id, user_name, score, total, answers, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [userId, userName, score, parsedQuestions.length, JSON.stringify(results)]
    );

    return NextResponse.json({ results, score, total: parsedQuestions.length });
  } catch (error) {
    console.error("Error processing interview:", error);
    return NextResponse.json(
      { error: "Failed to process interview" },
      { status: 500 }
    );
  }
}

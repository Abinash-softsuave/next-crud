import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

interface Question {
  id: number;
  question: string;
  options: string | string[]; // Allow string for database fetch
  correct_answer: string;
  created_at: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const questions = (await query("SELECT * FROM questions")) as Question[];
    return NextResponse.json(
      questions.map((q) => {
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
      })
    );
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
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question, options, correctAnswer } = await request.json();
    if (!Array.isArray(options)) {
      return NextResponse.json(
        { error: "Options must be an array" },
        { status: 400 }
      );
    }
    const result = await query(
      "INSERT INTO questions (question, options, correct_answer, created_at) VALUES (?, ?, ?, NOW())",
      [question, JSON.stringify(options), correctAnswer]
    );
    return NextResponse.json({ id: (result as any).insertId });
  } catch (error) {
    console.error("Error adding question:", error);
    return NextResponse.json(
      { error: "Failed to add question" },
      { status: 500 }
    );
  }
}

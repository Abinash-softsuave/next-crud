"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Updated import
import QuestionForm from "../components/QuestionForm";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
}

export default function Admin() {
  const { data: session } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (!session || session.user.role !== "admin") {
      router.push("/");
      return;
    }
    fetchQuestions();
  }, [session, router]);

  const fetchQuestions = async () => {
    const res = await fetch("/api/questions");
    const data: Question[] = await res.json();
    setQuestions(data);
  };

  const handleAddQuestion = async (questionData: {
    question: string;
    options: string[];
    correctAnswer: string;
  }) => {
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questionData),
    });
    if (res.ok) {
      fetchQuestions();
    }
  };

  if (!session || session.user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
        <QuestionForm onSubmit={handleAddQuestion} />
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Existing Questions</h2>
          {questions.length === 0 ? (
            <p>No questions available.</p>
          ) : (
            <div className="grid gap-4">
              {questions.map((q) => (
                <div key={q.id} className="p-4 bg-white shadow-md rounded-lg">
                  <p className="font-bold">{q.question}</p>
                  <p>Options: {q.options.join(", ")}</p>
                  <p>Correct Answer: {q.correct_answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Question {
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

interface InterviewResults {
  results: Result[];
  score: number;
  total: number;
}

export default function Interview() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [results, setResults] = useState<InterviewResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Session status:", status, "Session data:", session);
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      fetchQuestions();
    }
  }, [status, router]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/interview");
      if (!res.ok) {
        throw new Error("Failed to fetch questions");
      }
      const data: Question[] = await res.json();
      console.log("Fetched questions:", data);
      setQuestions(data);
    } catch (err) {
      setError("Failed to load questions");
      console.error(err);
    }
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    console.log("Current answers:", newAnswers, "Selected answer:", answer);
    setAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAnswers(newAnswers);
    }
  };

  const submitAnswers = async (answersToSubmit: string[]) => {
    console.log("Submitting answers:", answersToSubmit, "Session:", session);
    if (!session?.user?.id) {
      setError("User session not found. Please sign in again.");
      router.push("/");
      return;
    }
    if (!session?.user?.name) {
      setError("User name not found in session. Please sign in again.");
      router.push("/");
      return;
    }
    if (answersToSubmit.length !== questions.length) {
      setError("Incomplete answers. Please answer all questions.");
      return;
    }
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          userName: session.user.name,
          answers: answersToSubmit,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to submit answers");
      }
      const data: InterviewResults = await res.json();
      console.log("Received results:", data);
      setResults(data);
    } catch (err) {
      setError("Failed to submit answers");
      console.error(err);
    }
  };

  if (status === "loading") return <div>Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!session) return null;

  if (results) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-2xl mx-auto bg-white p-6 shadow-md rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Interview Results</h1>
          <p className="mb-4">
            Score: {results.score} / {results.total}
          </p>
          {results.results.map((result, index) => {
            if (!questions[index]) {
              console.error("Question missing for index:", index);
              return null;
            }
            return (
              <div key={index} className="mb-4 p-4 border rounded">
                <p className="font-bold">
                  Question {index + 1}: {questions[index].question}
                </p>
                <p>Your Answer: {result.selectedAnswer}</p>
                <p>Correct Answer: {result.correctAnswer}</p>
                <p
                  className={
                    result.isCorrect ? "text-green-500" : "text-red-500"
                  }
                >
                  {result.isCorrect ? "Correct" : "Incorrect"}
                </p>
              </div>
            );
          })}
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!questions.length) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white p-6 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">
          Question {currentQuestion + 1}
        </h1>
        <p className="mb-4">{questions[currentQuestion].question}</p>
        <div className="grid gap-2">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className="p-2 border rounded hover:bg-blue-100"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

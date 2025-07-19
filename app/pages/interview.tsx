import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
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
  const { data: session } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [results, setResults] = useState<InterviewResults | null>(null);

  useEffect(() => {
    if (!session) {
      router.push("/");
      return;
    }
    fetchQuestions();
  }, [session, router]);

  const fetchQuestions = async () => {
    const res = await fetch("/api/interview");
    const data: Question[] = await res.json();
    setQuestions(data);
  };

  const handleAnswer = (answer: string) => {
    setAnswers([...answers, answer]);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAnswers();
    }
  };

  const submitAnswers = async () => {
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session?.user.id, answers }),
    });
    const data: InterviewResults = await res.json();
    setResults(data);
  };

  if (!session) return null;

  if (results) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-2xl mx-auto bg-white p-6 shadow-md rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Interview Results</h1>
          <p className="mb-4">
            Score: {results.score} / {results.total}
          </p>
          {results.results.map((result, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <p className="font-bold">
                Question {index + 1}: {questions[index].question}
              </p>
              <p>Your Answer: {result.selectedAnswer}</p>
              <p>Correct Answer: {result.correctAnswer}</p>
              <p
                className={result.isCorrect ? "text-green-500" : "text-red-500"}
              >
                {result.isCorrect ? "Correct" : "Incorrect"}
              </p>
            </div>
          ))}
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

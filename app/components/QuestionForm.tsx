import { useState } from "react";

interface QuestionFormProps {
  onSubmit: (data: {
    question: string;
    options: string[];
    correctAnswer: string;
  }) => void;
}

export default function QuestionForm({ onSubmit }: QuestionFormProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ question, options, correctAnswer });
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-lg"
    >
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      {options.map((option, index) => (
        <div key={index} className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Option {index + 1}
          </label>
          <input
            type="text"
            value={option}
            onChange={(e) => {
              const newOptions = [...options];
              newOptions[index] = e.target.value;
              setOptions(newOptions);
            }}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      ))}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Correct Answer
        </label>
        <select
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select correct answer</option>
          {options.map((option, index) => (
            <option key={index} value={option} disabled={!option}>
              {option || `Option ${index + 1}`}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Add Question
      </button>
    </form>
  );
}

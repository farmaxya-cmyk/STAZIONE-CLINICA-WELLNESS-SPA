import React from 'react';

const QuizScreen = ({ assessment, onComplete }) => {
    // FIX: Typed the 'answers' state to ensure values are treated as numbers, resolving the 'reduce' operation error.
    const [answers, setAnswers] = React.useState<Record<number, number>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);

    const handleAnswer = (questionIndex: number, value: number) => {
        setAnswers(prevAnswers => ({ ...prevAnswers, [questionIndex]: value }));
    };

    React.useEffect(() => {
        const allQuestionsAnswered = Object.keys(answers).length > 0 && Object.keys(answers).length === assessment.questions.length;
        if (allQuestionsAnswered) {
            // FIX: Explicitly type accumulator and value in reduce to ensure they are treated as numbers.
            const score = Object.values(answers).reduce((sum: number, value: number) => sum + value, 0);
            const timerId = setTimeout(() => onComplete(score), 350);
            return () => clearTimeout(timerId);
        }
    }, [answers, assessment.questions.length, onComplete]);

    React.useEffect(() => {
        if (answers[currentQuestionIndex] !== undefined) {
            const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1;
            if (!isLastQuestion) {
                const timerId = setTimeout(() => {
                    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
                }, 300);
                return () => clearTimeout(timerId);
            }
        }
    }, [answers, currentQuestionIndex, assessment.questions.length]);


    const allAnswered = Object.keys(answers).length === assessment.questions.length;

    if (allAnswered) {
        return (
            <div className="p-4 md:p-8 text-center animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-700">Calcolo dei risultati...</h2>
            </div>
        );
    }
        
    const currentQuestion = assessment.questions[currentQuestionIndex];
    const progress = (currentQuestionIndex / assessment.questions.length) * 100;

    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{assessment.title}</h2>
            <p className="text-slate-600 mb-6">Domanda {currentQuestionIndex + 1} di {assessment.questions.length}</p>

            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
                <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md animate-slide-in-up" key={currentQuestionIndex}>
                <h3 className="text-xl font-semibold text-slate-700 mb-6">{currentQuestion.text}</h3>
                <div className="space-y-3">
                    {currentQuestion.options.map((option, optionIndex) => (
                        <button
                            key={optionIndex}
                            onClick={() => handleAnswer(currentQuestionIndex, option.value)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 text-slate-700 ${
                                answers[currentQuestionIndex] === option.value
                                ? 'bg-sky-100 border-sky-500 font-semibold ring-2 ring-sky-300'
                                : 'bg-slate-50 border-slate-200 hover:bg-sky-50 hover:border-sky-400'
                            }`}
                        >
                            {option.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuizScreen;
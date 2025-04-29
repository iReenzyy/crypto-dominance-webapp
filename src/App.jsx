import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './index.css';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a78bfa'];

function App() {
  const [dominanceData, setDominanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  const tutorialSlides = [
    {
      title: "Добро пожаловать!",
      text: "Ты открыл приложение для отслеживания доминации главных криптовалют."
    },
    {
      title: "Что такое доминация?",
      text: "Это доля одного актива в общей капитализации всего крипторынка. Например, BTC > 50% = рынок под контролем Биткоина."
    },
    {
      title: "Что такое ALTS?",
      text: "ALTS — это все остальные альткоины. Их рост часто указывает на приближение альт-сезона."
    }
  ];

  const completeTutorial = () => {
    localStorage.setItem('tutorialCompleted', 'true');
    setTutorialCompleted(true);
    setTutorialStep(tutorialSlides.length);
  };

  const originalQuestions = [
    {
      question: "Что означает рост доминации BTC?",
      answers: [
        { text: "Выход инвесторов из рисковых активов", correct: true },
        { text: "Рост интереса к мем-коинам", correct: false },
        { text: "Снижение активности Биткоина", correct: false }
      ]
    },
    {
      question: "Что означает рост доминации ETH?",
      answers: [
        { text: "Рост интереса к децентрализованным приложениям (dApps)", correct: true },
        { text: "Рост вложений в стейблкоины", correct: false },
        { text: "Переход рынка в фазу страха", correct: false }
      ]
    },
    {
      question: "Что означает рост доминации USDT?",
      answers: [
        { text: "Уход капитала в стабильные активы", correct: true },
        { text: "Рост спроса на новые альткоины", correct: false },
        { text: "Переход рынка к бычьему тренду", correct: false }
      ]
    },
    {
      question: "Что означает рост доминации ALTS?",
      answers: [
        { text: "Люди начинают активно инвестировать в менее известные монеты", correct: true },
        { text: "Увеличение интереса к стейблкоинам", correct: false },
        { text: "Признак ухода капитала в BTC", correct: false }
      ]
    }
  ];

  const shuffleAnswers = (questions) => {
    return questions.map(q => ({
      ...q,
      answers: [...q.answers].sort(() => Math.random() - 0.5)
    }));
  };

  const [quizQuestions, setQuizQuestions] = useState(() => shuffleAnswers(originalQuestions));
  
  const fetchDominance = async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/global');
      const json = await res.json();
      const data = json.data.market_cap_percentage;
      const keysToShow = ['btc', 'eth', 'usdt'];
      const totalUsed = keysToShow.reduce((sum, key) => sum + data[key], 0);
      const altDominance = 100 - totalUsed;

      const chartData = keysToShow.map((key) => ({
        name: key.toUpperCase(),
        value: data[key]
      }));
      chartData.push({ name: 'ALTS', value: altDominance });
      setDominanceData(chartData);
      setLastUpdate(new Date().toLocaleTimeString());
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
    }
  };

  const handleAnswer = (isCorrect) => {
    setQuizAnswered(true);
    setQuizResult(isCorrect);
  };

  useEffect(() => {
    const completed = localStorage.getItem('tutorialCompleted');
    if (completed === 'true') {
      setTutorialCompleted(true);
      setTutorialStep(tutorialSlides.length);
    }
    fetchDominance();
    const interval = setInterval(fetchDominance, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 animate-fade">
      {!tutorialCompleted && tutorialStep < tutorialSlides.length ? (
        <div className="bg-gray-800 shadow-xl rounded-2xl p-6 max-w-md w-full animate-fade">
          <h1 className="text-2xl font-bold text-center mb-4">{tutorialSlides[tutorialStep].title}</h1>
          <p className="text-gray-400 text-center mb-6">{tutorialSlides[tutorialStep].text}</p>
          <button
            onClick={() => {
              if (tutorialStep === tutorialSlides.length - 1) {
                completeTutorial();
              } else {
                setTutorialStep(tutorialStep + 1);
              }
            }}
            className="block mx-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
          >
            {tutorialStep === tutorialSlides.length - 1 ? "Перейти к графику" : "Далее"}
          </button>
        </div>

) : (
  <div className="bg-gray-800 shadow-xl rounded-2xl p-6 max-w-md w-full">
    <h1 className="text-3xl font-bold text-center mb-4">📊 Crypto Dominance</h1>
    <p className="text-gray-400 text-center mb-2">Обновляется каждые 30 секунд</p>

    {loading ? (
      <div className="text-center py-10">⏳ Загрузка...</div>
    ) : (
      <>
        <ul className="mb-4 text-center space-y-1">
          {dominanceData.map((item) => (
            <li key={item.name}>
              <span className="font-semibold">{item.name}</span>: {item.value.toFixed(2)}%
            </li>
          ))}
        </ul>

        <div className="h-72">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={dominanceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={({ value }) => `${value.toFixed(2)}%`}
              >
                {dominanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v.toFixed(2)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <button
          onClick={() => setQuizActive(true)}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Пройти тест
        </button>

        <button
          onClick={() => setShowInfo(true)}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Что такое доминация?
        </button>

        {showInfo && (
                <div className="bg-gray-700 mt-4 p-4 rounded-lg text-sm text-gray-300">
                  <h2 className="font-bold text-lg mb-2 text-center">Что такое доминация?</h2>
                  <p>Доминация — это доля одного актива в общей капитализации всего крипторынка. Показывает, сколько он "весит" на рынке.</p>
                  <p>Например, если общая капитализация рынка стоит $100, а Биткоин — $60, его доминация = 60%.</p>
                  <p>Отслеживайте доминацию, чтобы понимать текущее настроение инвесторов.</p>
                  <p><strong>ALTS</strong> — совокупность всех остальных альткоинов, кроме BTC, ETH и USDT.</p>
                  
                  <button
                    onClick={() => setShowInfo(false)}
                    className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded block mx-auto"
                  >
                    Закрыть
                  </button>
                </div>
              )}

              {quizActive && (
                <div className="bg-gray-700 mt-6 p-4 rounded-lg text-sm text-gray-300">
                  {!quizAnswered ? (
                    <>
                      <h2 className="font-bold text-lg mb-4 text-center">{quizQuestions[currentQuestion].question}</h2>
                      <div className="space-y-2">
                        {quizQuestions[currentQuestion].answers.map((answer, index) => (
                          <button
                            key={index}
                            onClick={() => handleAnswer(answer.correct)}
                            className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                          >
                            {answer.text}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className={`font-bold text-lg mb-2 text-center ${quizResult ? 'text-green-400' : 'text-red-400'}`}>
                        {quizResult ? '✅ Правильно!' : '❌ Неверно'}
                      </h2>
                      <p className="text-center mb-4">
                        {quizResult ? "Отлично!" : "Не переживай, продолжай учиться!"}
                      </p>
                      {currentQuestion < quizQuestions.length - 1 ? (
                        <button
                          onClick={() => {
                            setQuizAnswered(false);
                            setCurrentQuestion(currentQuestion + 1);
                          }}
                          className="block bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mx-auto"
                        >
                          Следующий вопрос
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setQuizActive(false);
                            setQuizAnswered(false);
                            setCurrentQuestion(0);
                          }}
                          className="block bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded mx-auto"
                        >
                          Завершить тест
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

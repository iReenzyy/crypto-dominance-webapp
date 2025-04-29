import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './index.css';

const COLORS = ['#f97316', '#3b82f6', '#10b981'];

function App() {
  const [dominanceData, setDominanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const fetchDominance = async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/global');
      const json = await res.json();
      const data = json.data.market_cap_percentage;
      const keysToShow = ['btc', 'eth', 'usdt'];
      const chartData = keysToShow.map((key) => ({
        name: key.toUpperCase(),
        value: data[key]
      }));
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
    fetchDominance();
    const interval = setInterval(fetchDominance, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 animate-fade">
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
                    label={({ name, value }) => `${value.toFixed(2)}%`}
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

            <p className="text-gray-500 text-sm mt-4 text-center">
              Последнее обновление: {lastUpdate}
            </p>

            <button
              onClick={() => setShowInfo(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Что такое доминация?
            </button>

            <button
              onClick={() => setQuizActive(true)}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Пройти тест
            </button>

            {showInfo && (
              <div className="bg-gray-700 mt-4 p-4 rounded-lg text-sm text-gray-300">
                <h2 className="font-bold text-lg mb-2 text-center">Что такое доминация?</h2>
                <p>Доминация — это доля актива в общей капитализации крипторынка.</p>
                <p>Высокая доминация BTC показывает уверенность в Биткоине и меньший интерес к альтам.</p>
                <p>Следите за изменением доминации, чтобы оценивать настроение рынка.</p>
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
                    <h2 className="font-bold text-lg mb-4 text-center">Тест: Что означает рост доминации BTC?</h2>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleAnswer(true)}
                        className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                      >
                        Выход инвесторов из рисковых активов
                      </button>
                      <button
                        onClick={() => handleAnswer(false)}
                        className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                      >
                        Рост интереса к мем-коинам
                      </button>
                      <button
                        onClick={() => handleAnswer(false)}
                        className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                      >
                        Снижение активности Биткоина
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className={`font-bold text-lg mb-2 text-center ${quizResult ? 'text-green-400' : 'text-red-400'}`}>
                      {quizResult ? '✅ Правильно!' : '❌ Неверно'}
                    </h2>
                    <p className="text-center mb-4">
                      Рост доминации BTC показывает уход инвесторов из рискованных активов в безопасные.
                    </p>
                    <button
                      onClick={() => { setQuizActive(false); setQuizAnswered(false); }}
                      className="block bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded mx-auto"
                    >
                      Назад к графику
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;

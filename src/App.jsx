import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './index.css';

const COLORS = ['#f97316', '#3b82f6', '#10b981'];

function App() {
  const [dominanceData, setDominanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

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
                    label
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
          </>
        )}
      </div>
    </div>
  );
}

export default App;

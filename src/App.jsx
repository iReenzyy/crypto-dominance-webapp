import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './index.css';

const COLORS = ['#f97316', '#3b82f6', '#10b981'];

function App() {
  const [dominanceData, setDominanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [previousData, setPreviousData] = useState(null);
  const [btcDominanceHigh, setBtcDominanceHigh] = useState(false);
  const [ethGrowingFast, setEthGrowingFast] = useState(false);
  const [usdtAlert, setUsdtAlert] = useState(false);

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
      checkDominanceChanges(chartData);
      setDominanceData(chartData);
      setLastUpdate(new Date().toLocaleTimeString());
      setLoading(false);
      setPreviousData(chartData);
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
    }
  };

  const checkDominanceChanges = (newData) => {
    if (!previousData) return;
    const btcNow = newData.find(item => item.name === 'BTC')?.value || 0;
    const btcPrev = previousData.find(item => item.name === 'BTC')?.value || 0;
    const ethNow = newData.find(item => item.name === 'ETH')?.value || 0;
    const ethPrev = previousData.find(item => item.name === 'ETH')?.value || 0;
    const usdtNow = newData.find(item => item.name === 'USDT')?.value || 0;
    const usdtPrev = previousData.find(item => item.name === 'USDT')?.value || 0;

    setBtcDominanceHigh(btcNow > 50);
    setEthGrowingFast(ethNow - ethPrev > 2);
    setUsdtAlert(usdtNow - usdtPrev > 1);
  };

  useEffect(() => {
    fetchDominance();
    const interval = setInterval(fetchDominance, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 animate-fade">
      <div className={`shadow-xl rounded-2xl p-6 max-w-md w-full ${btcDominanceHigh ? 'bg-yellow-400' : 'bg-gray-800'}`}>
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
                      <Cell key={`cell-${index}`} fill={ethGrowingFast && entry.name === 'ETH' ? '#60a5fa' : COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v.toFixed(2)}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {usdtAlert && (
              <div className="text-center text-red-500 font-bold animate-pulse mt-4">
                🚨 Внимание: рост интереса к стейблкоинам!
              </div>
            )}

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

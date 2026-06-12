import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

export default function Dashboard() {
  // Chart 1: Churn Ratio
  const dataRatio = [
    { name: 'Churn', value: 1869 },
    { name: 'Stay', value: 5174 },
  ];
  const COLORS = ['#ef4444', '#22c55e'];

  // Chart 2: Churn by Payment Method
  const dataPayment = [
    { name: 'Electronic check', Churn: 1071, Stay: 1294 },
    { name: 'Mailed check', Churn: 308, Stay: 1304 },
    { name: 'Bank transfer', Churn: 258, Stay: 1286 },
    { name: 'Credit card', Churn: 232, Stay: 1290 },
  ];

  // Chart 3: Churn by Online Security (New)
  const dataSecurity = [
    { name: 'No Security', Churn: 1461, Stay: 2037 },
    { name: 'With Security', Churn: 295, Stay: 1724 },
    { name: 'No Internet', Churn: 113, Stay: 1413 },
  ];

  // Chart 4: Churn by Tenure Bracket (New)
  const dataTenure = [
    { name: '1-12 Bln', Churn: 1037, Stay: 1149 },
    { name: '13-24 Bln', Churn: 294, Stay: 730 },
    { name: '25-48 Bln', Churn: 325, Stay: 1269 },
    { name: '49-72 Bln', Churn: 213, Stay: 2026 },
  ];

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h1 className="page-title">Analytics Dashboard</h1>
        <p className="page-subtitle">Visualisasi distribusi pelanggan Telco berdasarkan dataset pelatihan.</p>
      </div>

      <div className="dashboard-grid">
        {/* Card 1: Churn Ratio */}
        <div className="chart-card">
          <h3 className="chart-title">Rasio Churn Pelanggan</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataRatio}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {dataRatio.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Churn by Payment Method */}
        <div className="chart-card">
          <h3 className="chart-title">Churn berdasarkan Metode Pembayaran</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataPayment} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Legend iconType="circle" />
                <Bar dataKey="Churn" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={25} />
                <Bar dataKey="Stay" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Churn by Online Security */}
        <div className="chart-card">
          <h3 className="chart-title">Pengaruh Layanan Keamanan (Online Security)</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataSecurity} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Legend iconType="circle" />
                <Bar dataKey="Churn" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={25} />
                <Bar dataKey="Stay" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 4: Churn by Tenure Bracket */}
        <div className="chart-card">
          <h3 className="chart-title">Tren Churn berdasarkan Masa Berlangganan (Tenure)</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dataTenure} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorStay" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px' }} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="Churn" stroke="#ef4444" fillOpacity={1} fill="url(#colorChurn)" />
                <Area type="monotone" dataKey="Stay" stroke="#3b82f6" fillOpacity={1} fill="url(#colorStay)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

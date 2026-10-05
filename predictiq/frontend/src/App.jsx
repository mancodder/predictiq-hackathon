import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line
} from 'recharts';
import { 
  Users, AlertTriangle, DollarSign, Activity, ChevronRight, 
  ShieldCheck, AlertCircle, FileWarning, Search, LayoutDashboard, Database, TrendingUp,
  Moon, Sun, Bell, Settings, Filter, ShieldAlert, HeartPulse, BrainCircuit, Target
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';

const RISK_COLORS = {
  'HIGH': '#ef4444',
  'MEDIUM': '#eab308',
  'LOW': '#22c55e'
};

const HEALTH_COLORS = {
  'Critical': '#ef4444',
  'Watch': '#eab308',
  'Healthy': '#22c55e'
};

const PRIORITY_COLORS = {
  'CRITICAL': '#7e22ce', // Purple for critical business priority
  'MEDIUM': '#c2410c',   // Orange
  'LOW': '#475569'       // Slate
};

function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '₹0';
  return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatPercentage(value) {
  if (value === undefined || value === null) return '0%';
  return (value * 100).toFixed(1) + '%';
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800/80 p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

const mockTrendData = [
  { month: 'Jul', churnRate: 2.1, target: 2.5 },
  { month: 'Aug', churnRate: 2.3, target: 2.5 },
  { month: 'Sep', churnRate: 1.8, target: 2.5 },
  { month: 'Oct', churnRate: 2.4, target: 2.5 },
  { month: 'Nov', churnRate: 2.8, target: 2.5 },
  { month: 'Dec', churnRate: 3.1, target: 2.5 }, 
];



function ExecutiveOverview({ summary, customers, isDark }) {
  const riskData = [
    { name: 'High Risk', value: summary?.high_risk || 0, color: RISK_COLORS.HIGH },
    { name: 'Medium Risk', value: summary?.medium_risk || 0, color: RISK_COLORS.MEDIUM },
    { name: 'Low Risk', value: summary?.low_risk || 0, color: RISK_COLORS.LOW },
  ];

  const revenueImpact = React.useMemo(() => {
    if (!customers || customers.length === 0) return [];
    
    const segments = {};
    customers.forEach(c => {
      const contract = c.Contract || 'Unknown';
      if (!segments[contract]) {
        segments[contract] = { segment: contract, revenueAtRisk: 0, safeRevenue: 0 };
      }
      
      const revExposure = c.Revenue_Exposure || 0;
      const totalRev = c.MonthlyCharges || 0;
      const safeRev = Math.max(0, totalRev - revExposure);
      
      segments[contract].revenueAtRisk += revExposure;
      segments[contract].safeRevenue += safeRev;
    });
    
    return Object.values(segments).sort((a, b) => b.revenueAtRisk - a.revenueAtRisk);
  }, [customers]);

  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Executive Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">AI-driven retention intelligence and business exposure</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-500/20">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Users size={20} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Analyzed Base</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{summary?.total_customers?.toLocaleString() || 0}</h3>
          </div>
        </Card>
        
        <Card className="hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">High-Risk Accounts</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{summary?.high_risk?.toLocaleString() || 0}</h3>
          </div>
        </Card>
        
        <Card className="hover:border-purple-200 dark:hover:border-purple-900/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
              <Target size={20} />
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full">Intervene</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Critical Priority Accounts</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{summary?.high_priority?.toLocaleString() || 0}</h3>
          </div>
        </Card>
        
        <Card className="hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-colors border-emerald-500/20 dark:border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-900/5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <DollarSign size={20} />
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">Business Exposure</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total MRR at Risk</p>
            <h3 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{formatCurrency(summary?.revenue_at_risk)}</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <h3 className="text-base font-semibold mb-6 text-slate-900 dark:text-white">MRR Risk by Contract Segment</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueImpact} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={gridColor} />
                <XAxis type="number" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <YAxis dataKey="segment" type="category" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#fff' : '#000', borderRadius: '8px' }} />
                <Legend iconType="circle" />
                <Bar dataKey="safeRevenue" name="Safe MRR" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} barSize={32} />
                <Bar dataKey="revenueAtRisk" name="At-Risk MRR" stackId="a" fill="#f87171" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold mb-6 text-slate-900 dark:text-white">Risk Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#fff' : '#000', borderRadius: '8px' }} />
                <Legend iconType="circle" verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Top Priority Interventions (Ranked by Priority Score)</h3>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All in Database</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 rounded-t-lg">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg font-medium">Account ID</th>
                  <th className="px-4 py-3 font-medium">Priority Score</th>
                  <th className="px-4 py-3 font-medium">Risk Prob.</th>
                  <th className="px-4 py-3 font-medium">Revenue Exposed</th>
                  <th className="px-4 py-3 font-medium">Health</th>
                  <th className="px-4 py-3 rounded-tr-lg font-medium">Recommended Retention Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.slice(0, 5).map(c => (
                  <tr key={c.customerID} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">{c.customerID}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {c.Priority_Score}/100
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-red-500 font-medium">{formatPercentage(c.Churn_Prob)}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-semibold">{formatCurrency(c.Revenue_Exposure)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: HEALTH_COLORS[c.Health_Status] }}>
                        <HeartPulse size={12} /> {c.Health_Status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center gap-1">
                         {c.Recommended_Action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function CustomerExplorer({ customers, onSelectCustomer }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter(c => 
    c.customerID.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Customer Database</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Ranked automatically by Business Priority Score</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search Account ID..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 shadow-sm transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Account ID</th>
                <th className="px-6 py-4 font-medium">Priority Score</th>
                <th className="px-6 py-4 font-medium">Risk Score</th>
                <th className="px-6 py-4 font-medium">Health</th>
                <th className="px-6 py-4 font-medium">Revenue Exposed</th>
                <th className="px-6 py-4 font-medium">Segment</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filtered.map(c => (
                <tr key={c.customerID} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{c.customerID}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded font-bold text-xs border ${
                        c.Priority_Level === 'CRITICAL' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                     }`}>
                        {c.Priority_Score} / 100
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold" style={{ color: RISK_COLORS[c.Risk_Level] }}>{formatPercentage(c.Churn_Prob)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: HEALTH_COLORS[c.Health_Status] }}>
                        <HeartPulse size={12} /> {c.Health_Status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{formatCurrency(c.Revenue_Exposure)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-semibold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                      {c.Contract}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onSelectCustomer(c.customerID)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md transition-opacity hover:bg-blue-100 dark:hover:bg-blue-900/40"
                    >
                      360 View <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function CustomerDetail({ customerId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/customer/${customerId}`).then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, [customerId]);

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Running advanced heuristics and SHAP explanations...</div>;
  if (!data || data.error) return <div className="p-8 text-center text-red-500">Error loading account data</div>;

  const { details, explanations } = data;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm transition-all hover:shadow">
            <ChevronRight size={18} className="rotate-180" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Customer 360: {details.customerID}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Operational view for Customer Success Managers</p>
          </div>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 flex gap-4 items-start shadow-sm">
        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300">
            <BrainCircuit size={24} />
        </div>
        <div className="flex-1">
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 uppercase tracking-widest mb-1">Recommended Retention Action</h3>
            <p className="text-lg font-medium text-slate-800 dark:text-slate-100">{details.Recommended_Action}</p>
            <p className="text-xs text-blue-700/70 dark:text-blue-400/70 mt-1 italic">Generated from model risk drivers and business-priority rules.</p>
        </div>
      </div>

      {/* Decision Audit Trail */}
      <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
         <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Decision Explanation</h4>
         <div className="flex flex-wrap gap-4 items-center text-sm font-medium">
             <div className="flex flex-col">
                 <span className="text-slate-500 text-xs uppercase">Prediction</span>
                 <span className="text-red-500">{formatPercentage(details.Churn_Prob)} {details.Risk_Level}</span>
             </div>
             <ChevronRight className="text-slate-300" size={14}/>
             <div className="flex flex-col">
                 <span className="text-slate-500 text-xs uppercase">Impact</span>
                 <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(details.Revenue_Exposure)}</span>
             </div>
             <ChevronRight className="text-slate-300" size={14}/>
             <div className="flex flex-col">
                 <span className="text-slate-500 text-xs uppercase">Priority</span>
                 <span className="text-slate-900 dark:text-white">{details.Priority_Score}/100</span>
             </div>
             <ChevronRight className="text-slate-300" size={14}/>
             <div className="flex flex-col">
                 <span className="text-slate-500 text-xs uppercase">Action</span>
                 <span className="text-blue-600 dark:text-blue-400">{details.Recommended_Action}</span>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 flex flex-col relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-1`} style={{ backgroundColor: RISK_COLORS[details.Risk_Level] }}></div>
          
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-2">Predicted Churn Risk</h3>
          <div className="mt-4 text-5xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-2">
            {formatPercentage(details.Churn_Prob)}
            <span className="text-sm font-medium uppercase tracking-wide" style={{ color: RISK_COLORS[details.Risk_Level] }}>{details.Risk_Level}</span>
          </div>
          
          <div className="mt-8 flex flex-col gap-4 flex-1">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-sm text-slate-500 dark:text-slate-400">Business Priority Score</span>
              <span className="font-bold text-slate-900 dark:text-slate-200">{details.Priority_Score} / 100</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-sm text-slate-500 dark:text-slate-400">Revenue Exposed (MRR)</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{formatCurrency(details.Revenue_Exposure)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-sm text-slate-500 dark:text-slate-400">Health Status</span>
              <span className="font-semibold" style={{ color: HEALTH_COLORS[details.Health_Status] }}>{details.Health_Status}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-sm text-slate-500 dark:text-slate-400">Lifetime Tenure</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{details.tenure} Months</span>
            </div>
          </div>
        </Card>

        <Card className="col-span-2">
          <div className="mb-6 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Explainable AI (SHAP)</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Why is this customer at risk?</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Primary Risk Drivers
              </h4>
              <div className="space-y-4">
                {explanations.risk_factors.map((factor, i) => (
                  <div key={i} className="flex flex-col gap-1 mb-4 group">
                    <div className="flex items-center gap-4">
                        <div className="w-1/3 text-sm font-medium text-slate-800 dark:text-slate-200">{factor.feature}</div>
                        <div className="w-1/3 text-sm text-slate-500 dark:text-slate-400 truncate bg-slate-50 dark:bg-slate-800/30 px-2 py-1 rounded font-mono text-xs">{factor.value}</div>
                        <div className="w-1/3">
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex justify-end">
                            <div className="h-full bg-red-500/80 group-hover:bg-red-500 transition-colors" style={{ width: `${Math.min(factor.impact * 30, 100)}%` }}></div>
                        </div>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic">"{factor.reason}"</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Retentive Factors
              </h4>
              <div className="space-y-4">
                {explanations.protective_factors.map((factor, i) => (
                    <div key={i} className="flex flex-col gap-1 mb-4 group">
                    <div className="flex items-center gap-4">
                        <div className="w-1/3 text-sm font-medium text-slate-800 dark:text-slate-200">{factor.feature}</div>
                        <div className="w-1/3 text-sm text-slate-500 dark:text-slate-400 truncate bg-slate-50 dark:bg-slate-800/30 px-2 py-1 rounded font-mono text-xs">{factor.value}</div>
                        <div className="w-1/3">
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex justify-start">
                            <div className="h-full bg-emerald-500/80 group-hover:bg-emerald-500 transition-colors" style={{ width: `${Math.min(Math.abs(factor.impact) * 30, 100)}%` }}></div>
                        </div>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic">"{factor.reason}"</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ModelPerformance({ metrics, isDark }) {
  if (!metrics) return <div>Loading...</div>;

  const compareData = [
    { name: 'Log Reg', AUC: metrics['Logistic Regression']?.roc_auc, F1: metrics['Logistic Regression']?.f1 },
    { name: 'Random Forest', AUC: metrics['Random Forest']?.roc_auc, F1: metrics['Random Forest']?.f1 },
    { name: 'XGBoost', AUC: metrics['XGBoost']?.roc_auc, F1: metrics['XGBoost']?.f1 },
  ];
  
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Intelligence Engine</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Algorithm Performance & Validation Metrics</p>
        </div>
      </div>

      <div className="p-4 mb-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg flex items-start gap-4">
        <div className="p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
          <FileWarning className="text-blue-600 dark:text-blue-400" size={18} />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-sm">Evaluation Protocol Note</h4>
          <p className="text-sm mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">Cross-validation uses an 80/20 stratified holdout validation to preserve real-world churn imbalance. All metrics represent strict out-of-sample performance.</p>
          <p className="text-sm mt-1 text-slate-500 dark:text-slate-500 italic">Temporal Validation: Not available — Source dataset does not contain longitudinal timestamps.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Selected Model: XGBoost</h3>
            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase rounded">Deployed</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">XGBoost was selected because it achieved the strongest balance of recall and precision (F1) at the 0.50 threshold with scale_pos_weight enabled.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-[#1e293b] rounded-lg border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ROC-AUC</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics['XGBoost']?.roc_auc?.toFixed(4)}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-[#1e293b] rounded-lg border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">F1 Score</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics['XGBoost']?.f1?.toFixed(4)}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-[#1e293b] rounded-lg border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Precision</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics['XGBoost']?.precision?.toFixed(4)}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-[#1e293b] rounded-lg border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recall</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics['XGBoost']?.recall?.toFixed(4)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold mb-6 text-slate-900 dark:text-white">Algorithm Benchmark</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0.5, 0.9]} stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#fff' : '#000', borderRadius: '8px' }} cursor={{fill: isDark ? '#1e293b' : '#f8fafc'}} />
                <Legend iconType="circle" />
                <Bar dataKey="AUC" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="F1" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ModelMonitoring({ monitoring }) {
  if (!monitoring || !monitoring.data_quality) return <div>Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Data Health & Leakage</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Live from Data Pipeline Execution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Data Quality Audit</h3>
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <ShieldCheck size={14} /> {monitoring.data_quality.status}
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Records</span>
              <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-900 dark:text-slate-200">{monitoring.data_quality.total_records}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Duplicate Rows Dropped</span>
              <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-900 dark:text-slate-200">{monitoring.data_quality.duplicate_records}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Missing Values Found</span>
              <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-900 dark:text-slate-200">
                {Object.values(monitoring.data_quality.missing_values).reduce((a, b) => a + b, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Features Audited</span>
              <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-900 dark:text-slate-200">{monitoring.data_quality.features_checked}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Target Leakage Protection</h3>
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-md border border-emerald-200 dark:border-emerald-800">
              SECURE
            </span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-[#1e293b] rounded-lg border border-slate-100 dark:border-slate-800 mb-4">
             <p className="text-sm text-slate-700 dark:text-slate-300 font-medium font-mono">{monitoring.data_quality.leakage_check}</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
             <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-wide">Class Imbalance Handling</h4>
             <p className="text-sm text-slate-600 dark:text-slate-400">
                Data pipeline implements strict stratification to maintain exact real-world churn distribution (0: {(monitoring.data_quality.class_balance['0'] * 100).toFixed(1)}%, 1: {(monitoring.data_quality.class_balance['1'] * 100).toFixed(1)}%) in holdout validation sets.
             </p>
          </div>
          <div className="p-4 mt-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30">
             <h4 className="text-xs font-bold text-amber-700 dark:text-amber-500 mb-1 uppercase tracking-wide flex items-center gap-1"><AlertTriangle size={14}/> Demo Simulation</h4>
             <p className="text-sm text-amber-600 dark:text-amber-400">
                Feature Drift Monitoring requires longitudinal/streaming production data. This section is a demo simulation—not based on live production data.
             </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('overview');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [summary, setSummary] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [monitoring, setMonitoring] = useState(null);
  
  // Theme State
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Apply theme to document root
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    // Load initial data
    axios.get(`${API_BASE}/dashboard/summary`).then(res => setSummary(res.data)).catch(console.error);
    axios.get(`${API_BASE}/customers`).then(res => setCustomers(res.data)).catch(console.error);
    axios.get(`${API_BASE}/metrics`).then(res => setMetrics(res.data)).catch(console.error);
    axios.get(`${API_BASE}/data-health`).then(res => setMonitoring(res.data)).catch(console.error);
  }, []);

  const navigate = (view) => {
    setCurrentView(view);
    setSelectedCustomer(null);
  };

  const selectCustomer = (id) => {
    setSelectedCustomer(id);
    setCurrentView('detail');
  };

  return (
    <div className={`min-h-screen flex font-sans selection:bg-blue-200 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 ${isDark ? 'dark bg-[#030712]' : 'bg-[#f8fafc]'}`}>
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#0a0f1c] flex flex-col z-10 hidden md:flex border-r border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 dark:bg-blue-500 p-1.5 rounded-md shadow-sm">
              <TrendingUp size={16} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">PredictIQ</h1>
          </div>
        </div>
        
        <div className="p-4 pb-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-2">Platform</p>
          <nav className="space-y-1">
            <button 
              onClick={() => navigate('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                currentView === 'overview' 
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutDashboard size={16} /> Overview
            </button>
            
            <button 
              onClick={() => navigate('explorer')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                currentView === 'explorer' || currentView === 'detail'
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users size={16} /> Customer Database
            </button>
          </nav>
        </div>

        <div className="p-4 pt-2 flex-1">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-2 mt-4">Intelligence</p>
          <nav className="space-y-1">
            <button 
              onClick={() => navigate('performance')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                currentView === 'performance' 
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Activity size={16} /> Engine Metrics
            </button>
            
            <button 
              onClick={() => navigate('monitoring')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                currentView === 'monitoring' 
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Database size={16} /> Data Health
            </button>
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors mb-4"
          >
            <span className="flex items-center gap-3">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDark ? 'bg-blue-500' : 'bg-slate-300'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${isDark ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
          </button>
          
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-400 ring-2 ring-white dark:ring-[#0a0f1c]">
              MH
            </div>
            <div className="text-sm">
              <p className="text-slate-900 dark:text-white font-medium">Manthan Handa</p>
              <p className="text-xs text-slate-500 dark:text-slate-500">Microsoft Hackathon</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-[#0a0f1c]/50 backdrop-blur-md z-10 transition-colors duration-200">
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Platform</span>
            <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
            <span className="text-slate-900 dark:text-slate-200 capitalize">
              {currentView === 'detail' ? 'Customer 360' : currentView.replace('-', ' ')}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0a0f1c]"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-8 relative">
          <div className="max-w-[1400px] mx-auto w-full">
            {currentView === 'overview' && <ExecutiveOverview summary={summary} customers={customers} isDark={isDark} />}
            {currentView === 'explorer' && <CustomerExplorer customers={customers} onSelectCustomer={selectCustomer} />}
            {currentView === 'detail' && selectedCustomer && <CustomerDetail customerId={selectedCustomer} onBack={() => navigate('explorer')} />}
            {currentView === 'performance' && <ModelPerformance metrics={metrics} isDark={isDark} />}
            {currentView === 'monitoring' && <ModelMonitoring monitoring={monitoring} />}
          </div>
        </main>
      </div>
    </div>
  );
}

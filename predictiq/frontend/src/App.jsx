import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line
} from 'recharts';
import { 
  Users, AlertTriangle, DollarSign, Activity, ChevronRight, 
  ShieldCheck, AlertCircle, FileWarning, Search, LayoutDashboard, Database, TrendingUp,
  Moon, Sun, Bell, Settings, Filter, ShieldAlert, HeartPulse, BrainCircuit, Target, Sparkles, Mail, Send, Wand2, RefreshCw, Download, Cloud, Headphones, MessageSquare
} from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

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



function ExecutiveOverview({ summary, customers, isDark, onViewDatabase }) {
  const topPriorityCustomers = React.useMemo(() => {
    if (!customers) return [];
    return [...customers].sort((a, b) => (b.Priority_Score || 0) - (a.Priority_Score || 0));
  }, [customers]);
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

  const handleExportCSV = () => {
    if (!customers || customers.length === 0) return;
    const headers = ['Account ID', 'Priority Score', 'Risk Prob', 'Health', 'Revenue Exposed', 'Recommended Action'];
    const rows = customers.map(c => [
      c.customerID, 
      c.Priority_Score, 
      formatPercentage(c.Churn_Prob), 
      c.Health_Status, 
      c.Revenue_Exposure, 
      `"${c.Recommended_Action}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "PredictIQ_Priority_List.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Executive Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">AI-driven retention intelligence and business exposure</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-500/20">
            <Download size={16} /> Export Priority List
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

      <div className="grid grid-cols-1 gap-6 mb-6 mt-6">
        <Card>
          <h3 className="text-base font-semibold mb-1 text-slate-900 dark:text-white">Global Risk Distribution Heatmap</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Real-time geographical tracking of high-priority interventions.</p>
          <LiveGeographicMap />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Top Priority Interventions (Ranked by Priority Score)</h3>
            <button onClick={onViewDatabase} className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">View All in Database</button>
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
                {topPriorityCustomers.slice(0, 5).map(c => (
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

function CustomerExplorer({ customers, onSelectCustomer, isCompactView }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filtered = customers.filter(c => {
    const matchesSearch = c.customerID.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'CRITICAL') return c.Priority_Level === 'CRITICAL';
    if (filterType === 'HIGH_RISK') return c.Risk_Level === 'HIGH';
    if (filterType === 'MTM') return c.Contract === 'Month-to-month';
    return true;
  });

  // Sort critical accounts so the most urgent ones are at the top
  if (filterType === 'CRITICAL') {
    filtered.sort((a, b) => b.Priority_Score - a.Priority_Score);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Customer Database</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Showing {filtered.length} of {customers.length} accounts</p>
        </div>
        <div className="flex gap-4 items-center">
            <div className="hidden md:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button onClick={() => setFilterType('ALL')} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filterType === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>All</button>
                <button onClick={() => setFilterType('CRITICAL')} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filterType === 'CRITICAL' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Critical Priority</button>
                <button onClick={() => setFilterType('HIGH_RISK')} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filterType === 'HIGH_RISK' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>High Risk</button>
                <button onClick={() => setFilterType('MTM')} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filterType === 'MTM' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Month-to-month</button>
            </div>
            <div className="relative w-64">
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
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className={`px-6 ${isCompactView ? 'py-2' : 'py-4'} font-medium`}>Account ID</th>
                <th className={`px-6 ${isCompactView ? 'py-2' : 'py-4'} font-medium`}>Priority Score</th>
                <th className={`px-6 ${isCompactView ? 'py-2' : 'py-4'} font-medium`}>Risk Score</th>
                <th className={`px-6 ${isCompactView ? 'py-2' : 'py-4'} font-medium`}>Health</th>
                <th className={`px-6 ${isCompactView ? 'py-2' : 'py-4'} font-medium`}>Revenue Exposed</th>
                <th className={`px-6 ${isCompactView ? 'py-2' : 'py-4'} font-medium`}>Segment</th>
                <th className={`px-6 ${isCompactView ? 'py-2' : 'py-4'} font-medium text-right`}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filtered.slice(0, 500).map(c => (
                <tr key={c.customerID} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className={`px-6 ${isCompactView ? 'py-1.5' : 'py-4'} font-medium text-slate-900 dark:text-slate-200`}>{c.customerID}</td>
                  <td className={`px-6 ${isCompactView ? 'py-1.5' : 'py-4'}`}>
                     <span className={`px-2 py-1 rounded font-bold text-xs border ${
                        c.Priority_Level === 'CRITICAL' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                     }`}>
                        {c.Priority_Score} / 100
                     </span>
                  </td>
                  <td className={`px-6 ${isCompactView ? 'py-1.5' : 'py-4'}`}>
                    <span className="font-semibold" style={{ color: RISK_COLORS[c.Risk_Level] }}>{formatPercentage(c.Churn_Prob)}</span>
                  </td>
                  <td className={`px-6 ${isCompactView ? 'py-1.5' : 'py-4'}`}>
                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: HEALTH_COLORS[c.Health_Status] }}>
                        <HeartPulse size={12} /> {c.Health_Status}
                    </span>
                  </td>
                  <td className={`px-6 ${isCompactView ? 'py-1.5' : 'py-4'} text-slate-600 dark:text-slate-400 font-medium`}>{formatCurrency(c.Revenue_Exposure)}</td>
                  <td className={`px-6 ${isCompactView ? 'py-1.5' : 'py-4'}`}>
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-semibold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                      {c.Contract}
                    </span>
                  </td>
                  <td className={`px-6 ${isCompactView ? 'py-1.5' : 'py-4'} text-right`}>
                    <button 
                      onClick={() => onSelectCustomer(c.customerID)}
                      className={`inline-flex items-center gap-1 px-3 ${isCompactView ? 'py-1' : 'py-1.5'} text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md transition-opacity hover:bg-blue-100 dark:hover:bg-blue-900/40`}
                    >
                      360 View <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 500 && (
            <div className="text-center py-3 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
              Showing top 500 of {filtered.length} results to maintain performance. Use search or filters to narrow down.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function CustomerDetail({ customerId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftedText, setDraftedText] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedData, setSimulatedData] = useState(null);

  const [newNote, setNewNote] = useState('');
  const [teamNotes, setTeamNotes] = useState([
    {
      id: 1,
      initials: 'SJ',
      name: 'Sarah Jenkins',
      role: 'Sales',
      time: '2 hours ago',
      text: 'Customer reached out about pricing for Q4. Given the risk score, I think we should proactively offer the 15% annual upgrade discount.',
      colorClass: 'bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
    },
    {
      id: 2,
      initials: 'MR',
      name: 'Mike Ross',
      role: 'Support',
      time: '1 day ago',
      text: 'Resolved ticket #1042 regarding fiber optic downtime. Customer seemed frustrated but thanked us for the quick response.',
      colorClass: 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
    }
  ]);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now(),
      initials: 'MH',
      name: 'Manthan Handa',
      role: 'VP of CS',
      time: 'Just now',
      text: newNote,
      colorClass: 'bg-purple-100 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
    };
    
    setTeamNotes([note, ...teamNotes]);
    setNewNote('');
  };

  useEffect(() => {
    axios.get(`${API_BASE}/customer/${customerId}`).then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, [customerId]);

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Running advanced heuristics and SHAP explanations...</div>;
  if (!data || data.error) return <div className="p-8 text-center text-red-500">Error loading account data</div>;

  const { details, explanations } = data;

  const handleGenerateEmail = () => {
    setShowEmail(true);
    setIsDrafting(true);
    setDraftedText('');
    
    // Dynamically build the email based on ML SHAP reasons
    const riskFactorText = explanations.risk_factors.slice(0, 2).map(f => f.feature.toLowerCase()).join(' and ');
    
    const fullEmail = `Subject: Exclusive Account Review & Upgrade Offer

Hi there,

I'm your dedicated Customer Success Manager. We noticed you've been with us for ${details.tenure} months, and we truly value your business! 

Our system flagged that you might be experiencing friction regarding your ${riskFactorText}. We want to proactively resolve this for you.

Based on your profile, we can offer you the following immediately:
**${details.Recommended_Action}**

Would you have 5 minutes this Thursday for a quick call to apply this to your account?

Best regards,
PredictIQ Retention Agent`;

    let i = 0;
    const interval = setInterval(() => {
      setDraftedText(fullEmail.substring(0, i));
      i += 3; // Typing speed
      if (i > fullEmail.length) {
        clearInterval(interval);
        setDraftedText(fullEmail);
        setIsDrafting(false);
      }
    }, 15);
  };

  const handleToggleSimulation = async () => {
    if (simulatedData) {
      setSimulatedData(null);
      return;
    }
    
    setIsSimulating(true);
    try {
      // Simulate upgrading a Month-to-month contract to a One year contract
      const res = await axios.post(`${API_BASE}/simulate`, {
        customer_id: details.customerID,
        overrides: { Contract: "One year" }
      });
      setSimulatedData(res.data);
    } catch (e) {
      console.error(e);
    }
    setIsSimulating(false);
  };

  const handleDownloadBrief = () => {
    const briefContent = `PREDICTIQ CUSTOMER BRIEF
Account ID: ${details.customerID}
Generated: ${new Date().toLocaleDateString()}
----------------------------------------
Priority Score: ${details.Priority_Score} / 100
Churn Risk: ${formatPercentage(details.Churn_Prob)} (${details.Risk_Level})
Health Status: ${details.Health_Status}
Revenue Exposed: ${formatCurrency(details.Revenue_Exposure)}
Current Contract: ${details.Contract}
Lifetime Tenure: ${details.tenure} Months

RECOMMENDED ACTION
${details.Recommended_Action}

PRIMARY RISK DRIVERS
${explanations.risk_factors.map(f => `- ${f.reason}`).join('\n')}

PROTECTIVE FACTORS
${explanations.protective_factors.map(f => `- ${f.reason}`).join('\n')}
`;
    
    const blob = new Blob([briefContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Account_Brief_${details.customerID}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendOutlook = () => {
    let subject = "Exclusive Account Review & Upgrade Offer";
    let body = draftedText;
    
    if (draftedText.startsWith("Subject: ")) {
      const parts = draftedText.split('\n\n');
      subject = parts[0].replace("Subject: ", "");
      body = parts.slice(1).join('\n\n');
    }
    
    const mailtoLink = `mailto:customer_${details.customerID.toLowerCase()}@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

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
        <button onClick={handleDownloadBrief} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium transition-all shadow-sm">
          <Download size={16} /> Download Brief
        </button>
      </div>

      {/* AI Recommendation Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center shadow-sm">
        <div className="flex gap-4 items-start flex-1">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300">
                <BrainCircuit size={24} />
            </div>
            <div>
                <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 uppercase tracking-widest mb-1">Recommended Retention Action</h3>
                <p className="text-lg font-medium text-slate-800 dark:text-slate-100">{details.Recommended_Action}</p>
                <p className="text-xs text-blue-700/70 dark:text-blue-400/70 mt-1 italic">Generated from model risk drivers and business-priority rules.</p>
            </div>
        </div>
        <button 
          onClick={handleGenerateEmail}
          className="mt-4 md:mt-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-md"
        >
          <Sparkles size={16} className={isDrafting ? "animate-pulse" : ""} /> 
          Draft Email with GenAI
        </button>
      </div>

      {/* Simulated GenAI Email Window */}
      {showEmail && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
              <Mail size={16} className="text-blue-500" />
              Generative AI Compose
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
          </div>
          <div className="p-5 font-mono text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap min-h-[150px]">
            {draftedText}
            {isDrafting && <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse"></span>}
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <button onClick={handleSendOutlook} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors disabled:opacity-50" disabled={isDrafting}>
              <Send size={14} /> Send via Outlook
            </button>
          </div>
        </div>
      )}

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
        <Card className="col-span-1 flex flex-col relative overflow-hidden transition-colors duration-500" style={{ borderColor: simulatedData ? '#fcd34d' : '' }}>
          <div className={`absolute top-0 left-0 right-0 h-1 transition-colors duration-500`} style={{ backgroundColor: simulatedData ? RISK_COLORS[simulatedData.new_risk_level] : RISK_COLORS[details.Risk_Level] }}></div>
          
          <div className="flex justify-between items-start mt-2">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Predicted Churn Risk</h3>
              <button 
                onClick={handleToggleSimulation}
                disabled={isSimulating}
                className={`text-[10px] px-2 py-1.5 rounded-md font-bold transition-all flex items-center gap-1 shadow-sm ${simulatedData ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-300 dark:border-amber-700/50' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
              >
                {isSimulating ? <RefreshCw size={12} className="animate-spin" /> : <Wand2 size={12} />}
                {simulatedData ? 'Clear Sandbox' : 'Sandbox: 1 Yr Upgrade'}
              </button>
          </div>
          
          <div className="mt-4 text-5xl font-extrabold flex items-baseline gap-2 transition-all">
            {simulatedData ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex items-baseline gap-2">
                    <span className="text-slate-300 dark:text-slate-600 line-through text-2xl mr-1">{formatPercentage(details.Churn_Prob)}</span>
                    <span className="text-emerald-500">{formatPercentage(simulatedData.new_prob)}</span>
                    <span className="text-sm font-medium uppercase tracking-wide text-emerald-500">{simulatedData.new_risk_level}</span>
                </div>
            ) : (
                <div className="animate-in fade-in duration-300 flex items-baseline gap-2 text-slate-900 dark:text-white">
                    {formatPercentage(details.Churn_Prob)}
                    <span className="text-sm font-medium uppercase tracking-wide" style={{ color: RISK_COLORS[details.Risk_Level] }}>{details.Risk_Level}</span>
                </div>
            )}
          </div>
          
          <div className="mt-8 flex flex-col gap-4 flex-1">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-sm text-slate-500 dark:text-slate-400">Current Contract</span>
              <span className={`font-bold text-xs uppercase px-2 py-1 rounded transition-colors ${simulatedData ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                {simulatedData ? 'One year (Simulated)' : details.Contract}
              </span>
            </div>
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

      {/* Customer Journey Timeline and Collaboration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6">Recent Customer Interactions</h3>
            <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8">
                <div className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/30 border-2 border-red-500 z-10"></span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-mono">2 Days Ago</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200">Logged Support Ticket: "Billing Discrepancy"</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Sentiment: Negative. Issue escalated to tier 2 support and resolved.</p>
                </div>
                <div className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-500 z-10"></span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-mono">14 Days Ago</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200">Feature Usage Drop Detected</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">System detected 40% reduction in platform logins vs 30-day average. Triggered automated health check.</p>
                </div>
                <div className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500 z-10"></span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-mono">{details.tenure} Months Ago</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200">Account Onboarded</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Signed up with a {details.Contract} contract.</p>
                </div>
            </div>
        </Card>
        
        <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Team Notes & Collaboration</h3>
              <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase"><Cloud size={12}/> Synced to CRM</div>
            </div>
            
            <div className="flex flex-col h-[280px]">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                {teamNotes.map(note => (
                  <div key={note.id} className="flex gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold flex-shrink-0 shadow-sm ${note.colorClass}`}>
                      {note.initials}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg rounded-tl-none border border-slate-200 dark:border-slate-700 flex-1 shadow-sm">
                      <p className="font-semibold text-slate-900 dark:text-slate-200 text-xs mb-1">
                        {note.name} <span className="text-slate-400 font-normal ml-1">· {note.role} · {note.time}</span>
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{note.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleAddNote} className="mt-auto relative group">
                <input 
                  type="text" 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note (Syncs with Salesforce)..." 
                  className="w-full text-sm bg-white dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-900 dark:text-slate-200 placeholder-slate-400 transition-all shadow-sm"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-md p-1.5 transition-colors cursor-pointer">
                  <Send size={14} />
                </button>
              </form>
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
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);

  const [isCompactView, setIsCompactView] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainComplete, setRetrainComplete] = useState(false);

  const handleRetrain = () => {
    setIsRetraining(true);
    setRetrainComplete(false);
    setTimeout(() => {
      setIsRetraining(false);
      setRetrainComplete(true);
      setTimeout(() => setRetrainComplete(false), 3000);
    }, 2500);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setSyncComplete(false);
    
    // Simulate network sync with Salesforce/Zendesk
    setTimeout(() => {
      setIsSyncing(false);
      setSyncComplete(true);
      
      // Re-fetch data to simulate live updates
      axios.get(`${API_BASE}/dashboard/summary`).then(res => setSummary(res.data)).catch(console.error);
      axios.get(`${API_BASE}/customers`).then(res => setCustomers(res.data)).catch(console.error);
      
      // Reset button state after 3 seconds
      setTimeout(() => {
        setSyncComplete(false);
      }, 3000);
    }, 1500);
  };
  
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

        <div className="p-4 pt-2">
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

        <div className="p-4 pt-0 flex-1">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-2 mt-2">Integrations</p>
          <nav className="space-y-1">
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-default">
              <span className="flex items-center gap-3"><Cloud size={16} /> Salesforce</span>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700/80 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">Syncing</span>
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-default">
              <span className="flex items-center gap-3"><Headphones size={16} /> Zendesk</span>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">Active</span>
            </button>
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className={`w-full flex items-center justify-center gap-2 mt-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${isSyncing ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'} ${
                syncComplete 
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800/30'
                  : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-blue-100 dark:border-blue-800/30'
              }`}
            >
              {isSyncing ? (
                <><RefreshCw size={14} className="animate-spin" /> Syncing...</>
              ) : syncComplete ? (
                <><ShieldCheck size={14} /> Synced!</>
              ) : (
                <><RefreshCw size={14} /> Sync Now</>
              )}
            </button>
          </nav>
        </div>

        <div className="p-4 mx-4 mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full blur-md"></div>
          <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-1.5">
            <Sparkles size={12} className="text-blue-600 dark:text-blue-400" /> Copilot Active
          </p>
          <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80 leading-relaxed mb-3">
            Real-time churn simulation is running on 7,043 accounts.
          </p>
          <div className="w-full bg-blue-200 dark:bg-blue-900/40 rounded-full h-1.5 mb-1">
            <div className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full" style={{width: '100%'}}></div>
          </div>
          <p className="text-[9px] text-blue-500 dark:text-blue-400 text-right font-mono">100% Synced</p>
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
              <p className="text-xs text-slate-500 dark:text-slate-500">VP of Customer Success</p>
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
            <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors relative hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0a0f1c] animate-pulse"></span>
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 animate-in slide-in-from-top-2">
                      <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Live Alerts</h4>
                          <span className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">Mark all read</span>
                      </div>
                      <div className="flex flex-col max-h-[300px] overflow-y-auto">
                          <div className="p-3 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                              <p className="text-xs font-bold text-red-500 mb-1 flex items-center gap-1"><AlertTriangle size={12}/> Risk Spike</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300">Account 3389-YGYAI churn probability jumped +14% due to Support Ticket #892.</p>
                              <p className="text-[10px] text-slate-400 mt-1 font-mono">Just now</p>
                          </div>
                          <div className="p-3 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                              <p className="text-xs font-bold text-amber-500 mb-1 flex items-center gap-1"><AlertCircle size={12}/> Contract Expiring</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300">3 High-Value accounts have contracts expiring in 30 days. Recommend outreach.</p>
                              <p className="text-[10px] text-slate-400 mt-1 font-mono">1 hour ago</p>
                          </div>
                          <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                              <p className="text-xs font-bold text-emerald-500 mb-1 flex items-center gap-1"><ShieldCheck size={12}/> Retention Success</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300">Account 8734-ABC upgraded to Annual Contract successfully!</p>
                              <p className="text-[10px] text-slate-400 mt-1 font-mono">3 hours ago</p>
                          </div>
                      </div>
                  </div>
                )}
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                className={`p-2 transition-colors rounded-full ${showSettings ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Settings size={18} />
              </button>
              
              {showSettings && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 animate-in slide-in-from-top-2 p-2">
                    <div className="p-2 border-b border-slate-200 dark:border-slate-700 mb-2 flex justify-between items-center">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Quick Settings</h4>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded cursor-pointer transition-colors">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Auto-assign High Risk</span>
                        <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                      </label>
                      <label className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded cursor-pointer transition-colors">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Email Alerts (Daily)</span>
                        <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                      </label>
                      <label className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded cursor-pointer transition-colors">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Compact View</span>
                        <input type="checkbox" checked={isCompactView} onChange={(e) => setIsCompactView(e.target.checked)} className="rounded border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                      </label>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <button 
                        onClick={handleRetrain}
                        disabled={isRetraining}
                        className={`w-full text-left p-2 text-xs font-medium rounded transition-colors flex items-center gap-2 ${
                            retrainComplete 
                                ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                      >
                        {isRetraining ? (
                            <><RefreshCw size={12} className="animate-spin" /> Retraining Models...</>
                        ) : retrainComplete ? (
                            <><ShieldCheck size={12} /> Models Retrained Successfully</>
                        ) : (
                            <><RefreshCw size={12} /> Force Retrain Models</>
                        )}
                      </button>
                    </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-8 relative">
          <div className="max-w-[1400px] mx-auto w-full">
            {currentView === 'overview' && <ExecutiveOverview summary={summary} customers={customers} isDark={isDark} onViewDatabase={() => navigate('explorer')} />}
            {currentView === 'explorer' && <CustomerExplorer customers={customers} onSelectCustomer={selectCustomer} isCompactView={isCompactView} />}
            {currentView === 'detail' && selectedCustomer && <CustomerDetail customerId={selectedCustomer} onBack={() => navigate('explorer')} />}
            {currentView === 'performance' && <ModelPerformance metrics={metrics} isDark={isDark} />}
            {currentView === 'monitoring' && <ModelMonitoring monitoring={monitoring} />}
          </div>
        </main>
      </div>
      <CopilotChat />
    </div>
  );
}

function LiveGeographicMap() {
  const [locations, setLocations] = useState([
    { id: 'sf', name: 'San Francisco', coordinates: [-122.4194, 37.7749], accounts: 124, mrr: 45000, color: '#ef4444' },
    { id: 'ny', name: 'New York', coordinates: [-74.006, 40.7128], accounts: 289, mrr: 112000, color: '#ef4444' },
    { id: 'lon', name: 'London', coordinates: [-0.1276, 51.5074], accounts: 84, mrr: 34000, color: '#eab308' },
    { id: 'tok', name: 'Tokyo', coordinates: [139.6917, 35.6895], accounts: 156, mrr: 67000, color: '#ef4444' },
    { id: 'del', name: 'New Delhi', coordinates: [77.2090, 28.6139], accounts: 62, mrr: 18000, color: '#eab308' },
  ]);
  
  const [liveEvents, setLiveEvents] = useState([
    { id: 1, time: new Date().toLocaleTimeString([], { hour12: false }), text: 'System connected to global stream' }
  ]);

  useEffect(() => {
    // Simulate real-time data fluctuations
    const interval = setInterval(() => {
      // Randomly pick a location to update
      const locIndex = Math.floor(Math.random() * 5);
      const locs = ['San Francisco', 'New York', 'London', 'Tokyo', 'New Delhi'];
      const actions = ['Risk score elevated', 'Churn alert triggered', 'New critical account detected', 'MRR exposure increased'];
      
      setLocations(prev => {
        const next = [...prev];
        const change = Math.floor(Math.random() * 5) - 1; // -1 to +3
        if (next[locIndex].accounts + change > 0) {
          next[locIndex].accounts += change;
          next[locIndex].mrr += (change * 450);
        }
        return next;
      });

      // Add live event
      setLiveEvents(prev => {
        const newEvent = {
          id: Date.now(),
          time: new Date().toLocaleTimeString([], { hour12: false }),
          text: `${actions[Math.floor(Math.random() * actions.length)]} in ${locs[locIndex]}`
        };
        return [newEvent, ...prev].slice(0, 4); // keep last 4
      });
      
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[400px] w-full bg-[#0a0f1c] rounded-xl overflow-hidden relative border border-slate-800">
      {/* Live Indicator */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm border border-slate-700 px-3 py-1.5 rounded-full shadow-lg">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        <span className="text-xs font-semibold text-slate-200 tracking-wider">LIVE FEED</span>
      </div>

      {/* Live Event Log */}
      <div className="absolute bottom-4 left-4 z-10 w-64 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg p-3 shadow-2xl">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Activity size={12}/> Incoming Alerts</h4>
        <div className="flex flex-col gap-2">
          {liveEvents.map((ev, i) => (
            <div key={ev.id} className="text-xs animate-in slide-in-from-left-4 fade-in duration-300">
              <span className="text-blue-400 font-mono text-[10px] mr-1">[{ev.time}]</span>
              <span className={i === 0 ? "text-slate-100" : "text-slate-500"}>{ev.text}</span>
            </div>
          ))}
        </div>
      </div>

      <ComposableMap projectionConfig={{ scale: 140 }} className="w-full h-full bg-[#0a0f1c]">
        <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#1e293b"
                stroke="#334155"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#475569", outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
        
        {locations.map((loc) => (
          <Marker key={loc.id} coordinates={loc.coordinates}>
            <circle r={8} fill={loc.color} className="animate-ping opacity-75" />
            <circle r={4} fill={loc.color} />
            <g transform="translate(0, -15)">
              <rect x="-40" y="-14" width="80" height="18" fill="rgba(15, 23, 42, 0.9)" rx="4" stroke={loc.color} strokeWidth="1"/>
              <text textAnchor="middle" y="-2" style={{ fill: "#fff", fontSize: "9px", fontWeight: "bold" }}>
                {loc.name}: {loc.accounts}
              </text>
            </g>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}

function CopilotChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi Manthan, I'm PredictIQ Copilot. How can I help you analyze our customer data today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleQuery = (query, response) => {
    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 origin-bottom-right">
          <div className="bg-blue-600 p-3 text-white flex justify-between items-center">
            <span className="font-bold flex items-center gap-2 text-sm"><Sparkles size={14} /> PredictIQ Copilot</span>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded transition-colors cursor-pointer"><ChevronRight size={14} className="rotate-90" /></button>
          </div>
          <div className="h-64 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50 dark:bg-slate-900/50 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] p-2.5 rounded-lg text-[13px] leading-relaxed shadow-sm ${m.sender === 'user' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 self-end rounded-br-none border border-blue-200 dark:border-blue-800/30' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 self-start border border-slate-200 dark:border-slate-600 rounded-bl-none'}`}>
                {m.text}
              </div>
            ))}
            {isTyping && (
              <div className="bg-white dark:bg-slate-700 text-slate-500 self-start p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg rounded-bl-none shadow-sm flex gap-1 items-center h-9">
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2 font-bold uppercase tracking-wider">Suggested Queries</p>
            <div className="flex flex-col gap-1.5">
              <button 
                onClick={() => handleQuery("Which segment is highest risk?", "Based on the latest SHAP analysis, the Month-to-month segment using Fiber Optic internet has a 3x higher churn risk than the baseline.")}
                className="text-xs text-left p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md transition-colors cursor-pointer border border-slate-200 dark:border-slate-600"
              >
                Which segment is highest risk?
              </button>
              <button 
                onClick={() => handleQuery("Are there data anomalies?", "I have monitored the incoming Salesforce data pipeline. There is no significant data drift, and data health is at 98%.")}
                className="text-xs text-left p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md transition-colors cursor-pointer border border-slate-200 dark:border-slate-600"
              >
                Are there data anomalies?
              </button>
            </div>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 cursor-pointer ring-4 ring-blue-600/20 dark:ring-blue-500/20"
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { databases } from './appwrite';
import { Query } from 'appwrite';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Briefcase, 
  UserCircle, 
  Settings, 
  Search, 
  CheckCircle2, 
  Clock,
  Mail,
  RefreshCcw,
  FileText,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  Rocket,
  AlertCircle,
  MoreVertical,
  ChevronRight
} from 'lucide-react';

// --- Components ---

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      {trend && (
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
    </div>
  </motion.div>
);

const JobRow = ({ job, index }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="group flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-all"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
        <Briefcase className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-semibold text-slate-900">{job.title}</h4>
        <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
          <span>{job.company}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(job.$createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-4">
      {job.applied ? (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold ring-1 ring-green-100">
          <CheckCircle2 className="w-3.5 h-3.5" />
          APPLIED
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-xs font-bold ring-1 ring-amber-100">
          <Clock className="w-3.5 h-3.5" />
          PENDING
        </div>
      )}
      <a 
        href={job.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
      >
        <ExternalLink className="w-5 h-5" />
      </a>
    </div>
  </motion.div>
);

// --- Main App ---

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [stats, setStats] = useState({ found: 0, applied: 0, pending: 0, generated: 0 });

  const DATABASE_ID = '69889348002f04dda4db';
  const COLLECTION_ID = '6988934a003039a17205';

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.orderDesc('$createdAt'), Query.limit(25)]
      );
      setJobs(response.documents);
      
      const appliedCount = response.documents.filter(j => j.applied).length;
      setStats({
        found: response.total,
        applied: appliedCount,
        pending: response.total - appliedCount,
        generated: appliedCount
      });
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerBot = async () => {
    try {
      setIsBotRunning(true);
      await fetch('http://localhost:3001/run-bot', { method: 'POST' });
      // Notification would go here
    } catch (error) {
      console.error('Bot trigger error:', error);
    } finally {
      setTimeout(() => setIsBotRunning(false), 5000); // Visual feedback
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Job Leads', icon: Briefcase },
    { id: 'profile', label: 'Master CV', icon: UserCircle },
    { id: 'settings', label: 'Configuration', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">JobBot AI</h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Automated Career</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="font-semibold text-[15px]">{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight className="w-4 h-4 opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-6">
          <div className="bg-slate-900 rounded-2xl p-5 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Bot Engine</p>
                <div className={`w-2 h-2 rounded-full ${isBotRunning ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
              </div>
              <p className="text-sm font-medium mt-1">{isBotRunning ? 'Scraping Leads...' : 'Engine Ready'}</p>
              <button 
                onClick={triggerBot}
                disabled={isBotRunning}
                className="w-full mt-4 bg-white hover:bg-slate-100 disabled:bg-slate-700 text-slate-900 text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95 shadow-lg"
              >
                {isBotRunning ? 'Processing...' : 'Deploy Bot Now'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
            {loading && <RefreshCcw className="w-4 h-4 text-blue-500 animate-spin" />}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">Iredox Tech</span>
              <span className="text-xs text-green-500 font-medium">Verified Account</span>
            </div>
            <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-inner ring-4 ring-slate-50">
              I
            </div>
          </div>
        </header>

        <main className="flex-1 p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-10"
              >
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                  <div className="relative z-10 max-w-2xl">
                    <h3 className="text-3xl font-extrabold mb-3">Welcome back, Iredox!</h3>
                    <p className="text-blue-100 text-lg opacity-90">Your AI bot is currently monitoring 4 Nigerian job boards for Web Developer roles. You've applied to 5 jobs this week.</p>
                    <div className="flex gap-4 mt-8">
                      <button onClick={triggerBot} className="bg-white text-blue-800 px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:bg-blue-50 transition-all active:scale-95">
                        New Search
                      </button>
                      <button className="bg-blue-600/30 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-600/40 transition-all">
                        View Report
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Total Leads" value={stats.found} icon={Search} color="text-blue-600" trend="+12% today" />
                  <StatCard label="Applications" value={stats.applied} icon={Mail} color="text-green-600" trend="+5 this week" />
                  <StatCard label="Pending" value={stats.pending} icon={Clock} color="text-amber-600" />
                  <StatCard label="Success Rate" value="84%" icon={CheckCircle2} color="text-indigo-600" />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">Recent Job Opportunities</h3>
                      <button onClick={fetchJobs} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <div className="p-4 flex-1">
                      {loading ? (
                        <div className="h-64 flex items-center justify-center text-slate-400">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <span className="text-sm font-medium">Fetching newest leads...</span>
                          </div>
                        </div>
                      ) : jobs.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                          <AlertCircle className="w-12 h-12 mb-3 opacity-20" />
                          <p className="font-medium text-lg">No jobs found yet</p>
                          <p className="text-sm">Click 'Deploy Bot' to start searching.</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {jobs.slice(0, 8).map((job, i) => (
                            <JobRow key={job.$id} job={job} index={i} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
                    <div className="space-y-4">
                      <ActionBtn icon={FileText} label="Update Resume Template" color="bg-blue-50 text-blue-600" />
                      <ActionBtn icon={Mail} label="Edit Cover Letter AI" color="bg-indigo-50 text-indigo-600" />
                      <ActionBtn icon={Settings} label="Search Filter Settings" color="bg-slate-50 text-slate-600" />
                      <div className="mt-10 p-5 bg-amber-50 rounded-2xl border border-amber-100">
                        <h4 className="flex items-center gap-2 font-bold text-amber-800 mb-2">
                          <AlertCircle className="w-4 h-4" />
                          Important
                        </h4>
                        <p className="text-xs text-amber-700 leading-relaxed">Ensure your Gmail App Password is active for the auto-sender to function properly. Check connection status in settings.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">Master Professional Profile</h3>
                      <p className="text-slate-500 mt-1">This information is used by AI to generate your job-specific resumes.</p>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">
                        <Trash2 className="w-4 h-4" /> Reset
                      </button>
                      <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">
                        <Save className="w-4 h-4" /> Save Profile
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <InputGroup label="Full Name" value="Iredox" />
                      <InputGroup label="Professional Title" value="Full Stack Web Developer" />
                      <InputGroup label="Email Address" value="iredoxtech@gmail.com" />
                      <InputGroup label="Phone Number" value="+234 800 000 0000" />
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Technical Skills (Comma separated)</label>
                        <textarea rows="4" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 outline-none transition-all" defaultValue="React, Node.js, Next.js, Appwrite, Tailwind CSS, PostgreSQL, AWS, Docker"></textarea>
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Professional Summary</label>
                        <textarea rows="5" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 outline-none transition-all" defaultValue="Experienced Full Stack Developer with 4+ years of building scalable web applications. Passionate about automation and creating intuitive user experiences."></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const ActionBtn = ({ icon: Icon, label, color }) => (
  <button className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-2xl transition-all group">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-bold text-slate-700 text-sm">{label}</span>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
  </button>
);

const InputGroup = ({ label, value, type = "text" }) => (
  <div>
    <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
    <input 
      type={type} 
      defaultValue={value} 
      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 outline-none transition-all" 
    />
  </div>
);

export default App;

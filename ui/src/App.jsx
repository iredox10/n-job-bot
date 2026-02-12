import React, { useState, useEffect } from 'react';
import { databases } from './appwrite';
import { Query, ID } from 'appwrite';
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
  Save,
  Rocket,
  ShieldCheck,
  ChevronRight,
  Database,
  XCircle
} from 'lucide-react';

const DATABASE_ID = '69889348002f04dda4db';
const JOBS_COLL_ID = '6988934a003039a17205';
const PROFILE_COLL_ID = '698b0b5f00303e2b32fe';

const formatInterviewPrep = (data) => {
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    const questions = parsed.questions || parsed;
    if (Array.isArray(questions)) {
      return questions.map((item, i) => (
        <div key={i} className="mb-4 last:mb-0">
          <p className="font-bold text-blue-900">Q: {item.question}</p>
          <p className="mt-1 text-blue-800">A: {item.answer || item.expectedAnswer}</p>
        </div>
      ));
    }
  } catch (e) {}
  return <div className="whitespace-pre-wrap">{data}</div>;
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [stats, setStats] = useState({ found: 0, applied: 0, pending: 0, generated: 0 });
  const [selectedJob, setSelectedJob] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  
  const [profile, setProfile] = useState({
    name: 'Iredox',
    email: 'iredoxtech@gmail.com',
    phone: '+234 800 000 0000',
    title: 'Full Stack Web Developer',
    skills: 'React, Node.js, Appwrite, Tailwind CSS',
    summary: 'Experienced developer looking for automation roles.'
  });

  const [appSettings, setAppSettings] = useState({
    keywords: 'Web Developer',
    gmail_user: 'iredoxtech@gmail.com'
  });

  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : `http://${window.location.hostname}:3001`;

  useEffect(() => {
    initApp();
    const interval = setInterval(fetchJobs, 60000); 
    return () => clearInterval(interval);
  }, []);

  const initApp = async () => {
    setLoading(true);
    await fetchProfile();
    await fetchJobs();
    await fetchSettings();
    setLoading(false);
  };

  const fetchProfile = async () => {
    try {
      const response = await databases.listDocuments(DATABASE_ID, PROFILE_COLL_ID, [Query.limit(1)]);
      if (response.documents.length > 0) {
        setProfile(response.documents[0]);
      }
    } catch (e) {
      console.warn('Profile fetch failed:', e.message);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await databases.listDocuments(DATABASE_ID, JOBS_COLL_ID, [
        Query.orderDesc('$createdAt'), 
        Query.limit(50)
      ]);
      setJobs(response.documents);
      const appliedCount = response.documents.filter(j => j.applied).length;
      setStats({
        found: response.total,
        applied: appliedCount,
        pending: response.total - appliedCount,
        generated: appliedCount
      });
    } catch (e) { console.error('Fetch jobs error:', e); }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings`);
      const data = await res.json();
      setAppSettings(data);
    } catch (e) { console.error('Settings fetch error'); }
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      const data = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        title: profile.title,
        skills: profile.skills,
        summary: profile.summary
      };

      if (profile.$id) {
        await databases.updateDocument(DATABASE_ID, PROFILE_COLL_ID, profile.$id, data);
      } else {
        const newDoc = await databases.createDocument(DATABASE_ID, PROFILE_COLL_ID, ID.unique(), data);
        setProfile(newDoc);
      }
      alert('Profile saved successfully!');
    } catch (e) { 
      alert('Error saving profile: ' + e.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appSettings)
      });
      alert('Settings saved!');
    } catch (e) { 
      alert('Failed to save settings'); 
    } finally {
      setLoading(false);
    }
  };

  const triggerBot = async () => {
    try {
      setIsBotRunning(true);
      await fetch(`${API_URL}/api/run-bot`, { method: 'POST' });
      alert('Job Bot sequence initiated!');
    } catch (error) { 
      alert('Bot server unreachable.'); 
    } finally { 
      setTimeout(() => setIsBotRunning(false), 5000); 
    }
  };

  const initializeDatabase = async () => {
    try {
      setLoading(true);
      alert('Initializing database structure via backend...');
      await fetch(`${API_URL}/api/init-db`, { method: 'POST' });
      await fetchProfile();
      alert('Database initialization triggered. Please wait a few seconds and refresh.');
    } catch (e) {
      alert('Initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.$id,
          coverLetter: job.cover_letter,
          masterData: profile
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Application sent successfully!');
        fetchJobs();
        setReviewMode(false);
      } else {
        alert('Failed to send application: ' + data.error);
      }
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/download-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          job: selectedJob,
          profile
        })
      });
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Resume_${selectedJob.company}.${format === 'pdf' ? 'pdf' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert('Download failed');
    } finally {
      setLoading(false);
    }
  };

  const syncGitHub = async () => {
    const username = prompt('Enter your GitHub username:');
    if (!username) return;
    try {
      setLoading(true);
      await fetch(`${API_URL}/api/sync-github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      alert('GitHub projects synced to profile!');
      fetchProfile();
    } catch (e) { alert('Sync failed'); }
    finally { setLoading(false); }
  };

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
              <p className="text-xs text-slate-400 font-medium uppercase">Automated Career</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'jobs', label: 'Job Leads', icon: Briefcase },
            { id: 'profile', label: 'Master CV', icon: UserCircle },
            { id: 'settings', label: 'Configuration', icon: Settings },
          ].map((item) => (
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

        <div className="p-6 space-y-3">
          <button 
            onClick={initializeDatabase}
            className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-blue-600 text-xs font-bold py-2 border border-dashed border-slate-200 rounded-xl hover:border-blue-200 transition-all"
          >
            <Database className="w-3 h-3" /> Fix DB Structure
          </button>
          
          <div className="bg-slate-900 rounded-2xl p-5 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Bot Engine</p>
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
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab}
            </h2>
            {loading && <RefreshCcw className="w-4 h-4 text-blue-500 animate-spin" />}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{profile.name}</span>
              <span className="text-xs text-green-500 font-medium">System Online</span>
            </div>
            <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-inner ring-4 ring-slate-50">
              {profile.name[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashboardView stats={stats} jobs={jobs} loading={loading} onRefresh={fetchJobs} onTrigger={triggerBot} />}
            {activeTab === 'jobs' && <JobsView jobs={jobs} loading={loading} onRefresh={fetchJobs} onReview={(job) => { setSelectedJob(job); setReviewMode(true); }} />}
            {activeTab === 'profile' && <ProfileView profile={profile} setProfile={setProfile} onSave={saveProfile} onSyncGitHub={syncGitHub} loading={loading} />}
            {activeTab === 'settings' && <SettingsView settings={appSettings} setSettings={setAppSettings} onSave={saveSettings} />}
          </AnimatePresence>
        </main>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewMode && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Review Application</h3>
                  <p className="text-sm text-slate-500">{selectedJob.title} @ {selectedJob.company}</p>
                </div>
                <button onClick={() => setReviewMode(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><XCircle className="w-6 h-6 text-slate-400" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">AI Tailored Cover Letter</label>
                  <textarea 
                    rows="12" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-slate-700 leading-relaxed"
                    value={selectedJob.cover_letter}
                    onChange={(e) => setSelectedJob({...selectedJob, cover_letter: e.target.value})}
                  />
                </div>

                {selectedJob.interview_prep && (
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <h4 className="flex items-center gap-2 font-bold text-blue-900 mb-4">
                      <FileText className="w-4 h-4" />
                      AI Interview Prep
                    </h4>
                    <div className="text-sm text-blue-800 leading-relaxed">
                      {formatInterviewPrep(selectedJob.interview_prep)}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50/30">
                <button 
                  onClick={() => handleDownload('pdf')}
                  className="px-6 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5 text-red-500" /> Download PDF
                </button>
                <button 
                  onClick={() => handleDownload('word')}
                  className="px-6 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-5 h-5 text-blue-500" /> Download Word
                </button>
                <button 
                  onClick={() => handleApply(selectedJob)}
                  disabled={loading}
                  className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" /> {loading ? 'Sending...' : 'Approve & Send Application'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub-Views ---

const DashboardView = ({ stats, jobs, loading, onRefresh, onTrigger }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
    <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-10 text-white shadow-2xl shadow-blue-200">
      <h3 className="text-3xl font-extrabold mb-3">Welcome to JobBot AI</h3>
      <p className="text-blue-100 text-lg opacity-90 max-w-xl">Automating your job search in Nigeria. Sit back while we tailor your CV and apply to roles daily.</p>
      <div className="flex gap-4 mt-8">
        <button onClick={onTrigger} className="bg-white text-blue-800 px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:bg-blue-50">Deploy New Search</button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatBox label="Total Leads" value={stats.found} icon={Search} color="text-blue-600" />
      <StatBox label="Applications" value={stats.applied} icon={Mail} color="text-green-600" />
      <StatBox label="Pending" value={stats.pending} icon={Clock} color="text-amber-600" />
      <StatBox label="CVs Tailored" value={stats.generated} icon={FileText} color="text-indigo-600" />
    </div>

    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Recent Job Opportunities</h3>
        <button onClick={onRefresh} className="p-2.5 text-slate-400 hover:text-blue-600"><RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>
      <div className="p-4 divide-y divide-slate-50">
        {jobs.slice(0, 5).map(job => (
          <div key={job.$id} className="flex items-center justify-between py-4 px-2 hover:bg-slate-50 rounded-xl transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><Briefcase className="w-5 h-5" /></div>
              <div>
                <h5 className="font-bold text-slate-900">{job.title}</h5>
                <p className="text-xs text-slate-500">{job.company}</p>
              </div>
            </div>
            <a href={job.link} target="_blank" className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-all"><ExternalLink /></a>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const JobsView = ({ jobs, loading, onRefresh, onReview }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <tr>
            <th className="px-8 py-4">Position</th>
            <th className="px-8 py-4">Company</th>
            <th className="px-8 py-4">Status</th>
            <th className="px-8 py-4">Date Found</th>
            <th className="px-8 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {jobs.map(job => (
            <tr key={job.$id} className="hover:bg-slate-50/50">
              <td className="px-8 py-5 font-bold text-slate-900">{job.title}</td>
              <td className="px-8 py-5 text-slate-600">{job.company}</td>
              <td className="px-8 py-5">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${job.applied ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                  {job.applied ? 'APPLIED' : 'DRAFT'}
                </span>
              </td>
              <td className="px-8 py-5 text-sm text-slate-400">{new Date(job.$createdAt).toLocaleDateString()}</td>
              <td className="px-8 py-5 text-right space-x-3">
                {!job.applied && (
                  <button onClick={() => onReview(job)} className="text-blue-600 hover:text-blue-800 font-bold text-xs">REVIEW</button>
                )}
                <a href={job.link} target="_blank" className="text-slate-400 hover:text-blue-600 inline-flex items-center gap-1 font-bold text-xs">GO <ExternalLink className="w-3 h-3" /></a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);

const ProfileView = ({ profile, setProfile, onSave, onSyncGitHub, loading }) => (
  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between mb-10">
      <div>
        <h3 className="text-2xl font-bold text-slate-900">Master CV Builder</h3>
        <p className="text-slate-500">Provide your best experience. AI will tailor this data for each job.</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onSyncGitHub} className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">
          Sync GitHub
        </button>
        <button onClick={onSave} disabled={loading} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:bg-slate-400">
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-6">
        <Input label="Full Name" value={profile.name} onChange={v => setProfile({...profile, name: v})} />
        <Input label="Job Title" value={profile.title} onChange={v => setProfile({...profile, title: v})} />
        <Input label="Email" value={profile.email} onChange={v => setProfile({...profile, email: v})} />
        <Input label="Phone" value={profile.phone} onChange={v => setProfile({...profile, phone: v})} />
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Technical Skills</label>
          <textarea rows="4" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all" value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})}></textarea>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bio / Experience Summary</label>
          <textarea rows="5" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all" value={profile.summary} onChange={e => setProfile({...profile, summary: e.target.value})}></textarea>
        </div>
      </div>
    </div>
  </motion.div>
);

const SettingsView = ({ settings, setSettings, onSave }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8">
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><Settings className="w-6 h-6 text-blue-600" /> Bot Configuration</h3>
      <form onSubmit={onSave} className="space-y-6">
        <Input label="Job Search Keywords" value={settings.keywords} onChange={v => setSettings({...settings, keywords: v})} placeholder="e.g. Web Developer, React" />
        <Input label="Gmail User" value={settings.gmail_user} onChange={v => setSettings({...settings, gmail_user: v})} />
        <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all">Update System Environment</button>
      </form>
    </div>
  </motion.div>
);

// --- Helpers ---

const StatBox = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
    <div className={`p-3 rounded-2xl ${color} bg-opacity-10 w-fit mb-4`}><Icon className={color} /></div>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    <h4 className="text-3xl font-black text-slate-900 mt-1">{value}</h4>
  </div>
);

const Input = ({ label, value, onChange, placeholder = "", type = "text" }) => (
  <div>
    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-slate-700 shadow-inner" />
  </div>
);

export default App;

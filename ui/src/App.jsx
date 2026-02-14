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
  Database,
  XCircle,
  Target,
  Calendar,
  Award,
  TrendingUp,
  Zap,
  Sparkles,
  ChevronDown,
  Filter,
  Download,
  Send,
  Building2,
  MapPin,
  Phone,
  Globe,
  Linkedin,
  Github,
  GraduationCap,
  Languages,
  BriefcaseBusiness,
  AlertCircle,
  CheckCircle,
  X,
  Loader2
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
        <div key={i} className="p-4 bg-sky-50 rounded-xl border border-sky-100">
          <p className="font-semibold text-sky-900 flex items-start gap-2">
            <span className="text-sky-500 font-bold">Q{i+1}:</span> 
            {item.question}
          </p>
          <p className="mt-2 text-sky-700 text-sm leading-relaxed pl-6">{item.answer || item.expectedAnswer}</p>
        </div>
      ));
    }
  } catch (e) {}
  return <div className="whitespace-pre-wrap">{data}</div>;
};

const getScoreColor = (score) => {
  const s = parseInt(score);
  if (s >= 80) return { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200' };
  if (s >= 60) return { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200' };
  return { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-200' };
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [stats, setStats] = useState({ found: 0, applied: 0, pending: 0, generated: 0 });
  const [selectedJob, setSelectedJob] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [atsData, setAtsData] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [profile, setProfile] = useState({
    name: 'Iredox',
    email: 'iredoxtech@gmail.com',
    phone: '+234 800 000 0000',
    location: 'Lagos, Nigeria',
    title: 'Full Stack Web Developer',
    skills: 'React, Node.js, Appwrite, Tailwind CSS',
    summary: 'Experienced developer looking for automation roles.',
    work_history: '',
    education: '',
    certifications: '',
    languages: '',
    linkedin: '',
    github: '',
    portfolio: ''
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
        location: profile.location,
        title: profile.title,
        skills: profile.skills,
        summary: profile.summary,
        work_history: profile.work_history,
        education: profile.education,
        certifications: profile.certifications,
        languages: profile.languages,
        linkedin: profile.linkedin,
        github: profile.github,
        portfolio: profile.portfolio
      };

      if (profile.$id) {
        await databases.updateDocument(DATABASE_ID, PROFILE_COLL_ID, profile.$id, data);
      } else {
        const newDoc = await databases.createDocument(DATABASE_ID, PROFILE_COLL_ID, ID.unique(), data);
        setProfile(newDoc);
      }
      showToast('Profile saved successfully!', 'success');
    } catch (e) { 
      showToast('Error saving profile: ' + e.message, 'error');
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
      showToast('Settings saved!', 'success');
    } catch (e) { 
      showToast('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const triggerBot = async () => {
    try {
      setIsBotRunning(true);
      await fetch(`${API_URL}/api/run-bot`, { method: 'POST' });
      showToast('Job Bot started! Check back in a few minutes.', 'success');
    } catch (error) { 
      showToast('Bot server unreachable.', 'error');
    } finally { 
      setTimeout(() => setIsBotRunning(false), 5000); 
    }
  };

  const initializeDatabase = async () => {
    try {
      setLoading(true);
      await fetch(`${API_URL}/api/init-db`, { method: 'POST' });
      await fetchProfile();
      showToast('Database initialized successfully!', 'success');
    } catch (e) {
      showToast('Initialization failed.', 'error');
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
        showToast('Application sent successfully!', 'success');
        fetchJobs();
        setReviewMode(false);
      } else {
        showToast('Failed to send application: ' + data.error, 'error');
      }
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateAIReview = async () => {
    try {
      setLoading(true);
      let jobDesc = selectedJob.description;
      if (!jobDesc) {
        const scrapeRes = await fetch(`${API_URL}/api/scrape-job`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ link: selectedJob.link })
        });
        const scrapeData = await scrapeRes.json();
        jobDesc = scrapeData.description;
      }
      
      if (!jobDesc) {
        showToast('Could not fetch job description.', 'error');
        return;
      }

      const res = await fetch(`${API_URL}/api/generate-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jobDesc,
          masterData: profile
        })
      });
      const data = await res.json();
      if (data.interviewPrep) {
        const reviewData = JSON.stringify({
          questions: data.interviewPrep,
          summary: data.summary,
          highlights: data.highlights
        });
        setSelectedJob({ 
          ...selectedJob, 
          interview_prep: reviewData,
          cover_letter: data.coverLetter || selectedJob.cover_letter
        });
        showToast('AI review generated!', 'success');
      } else {
        showToast('Failed to generate review', 'error');
      }
    } catch (e) {
      showToast('Error generating review: ' + e.message, 'error');
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
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Server error');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Resume_${selectedJob.company.replace(/\s+/g, '_')}.${format === 'pdf' ? 'pdf' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('Resume downloaded!', 'success');
    } catch (e) {
      showToast('Download failed: ' + e.message, 'error');
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
      showToast('GitHub projects synced!', 'success');
      fetchProfile();
    } catch (e) { showToast('Sync failed', 'error'); }
    finally { setLoading(false); }
  };

  const updateJobStatus = async (jobId, statusData) => {
    try {
      await fetch(`${API_URL}/api/job/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statusData)
      });
      fetchJobs();
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const calculateScores = async (job) => {
    if (!job.interview_prep) return;
    
    setLoading(true);
    try {
      const jobData = JSON.parse(job.interview_prep);
      
      const [atsRes, matchRes] = await Promise.all([
        fetch(`${API_URL}/api/ats-score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeData: { summary: jobData.summary, skills: jobData.skills, workExperience: jobData.workExperience },
            jobDescription: job.title
          })
        }),
        fetch(`${API_URL}/api/match-score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userProfile: profile,
            jobDescription: job.title
          })
        })
      ]);
      
      const ats = await atsRes.json();
      const match = await matchRes.json();
      
      setAtsData(ats);
      setMatchData(match);
      
      await fetch(`${API_URL}/api/job/${job.$id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ats_score: ats.score, match_score: match.score })
      });
      
      fetchJobs();
      showToast('Scores calculated!', 'success');
    } catch (e) {
      showToast('Score calculation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-sky-600';
    toast.className = `fixed bottom-6 right-6 ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in font-medium`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const filteredJobs = jobs.filter(job => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return !job.applied;
    if (statusFilter === 'applied') return job.applied && !job.response_status;
    if (statusFilter === 'responses') return job.response_status;
    if (statusFilter === 'interviews') return job.interview_date;
    return true;
  });

  const trackerStats = {
    total: jobs.length,
    draft: jobs.filter(j => j.status === 'draft').length,
    sent: jobs.filter(j => j.status === 'sent').length,
    responses: jobs.filter(j => j.response_status).length,
    interviews: jobs.filter(j => j.interview_date).length
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Job Leads', icon: Briefcase },
    { id: 'tracker', label: 'Applications', icon: Target },
    { id: 'profile', label: 'Master CV', icon: UserCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="flex">
        <aside className={`fixed left-0 top-0 h-screen bg-white/80 backdrop-blur-xl border-r border-sky-100 flex flex-col transition-all duration-300 z-40 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200/50">
                <Zap className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-lg font-bold text-sky-900">JobBot</h1>
                  <p className="text-xs text-sky-500 font-medium">AI Career Assistant</p>
                </div>
              )}
            </div>
          </div>
          
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  activeTab === item.id 
                    ? 'bg-sky-100 text-sky-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 space-y-3">
            <button 
              onClick={initializeDatabase}
              className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-sky-600 text-xs font-medium py-2 border border-dashed border-slate-200 rounded-xl hover:border-sky-200 transition-all"
            >
              <Database className="w-4 h-4" /> 
              {!sidebarCollapsed && 'Fix DB'}
            </button>
            
            <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl p-4 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-4 -mt-4"></div>
              {!sidebarCollapsed ? (
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Bot Engine</span>
                  </div>
                  <p className="text-sm font-medium">{isBotRunning ? 'Running...' : 'Ready'}</p>
                  <button 
                    onClick={triggerBot}
                    disabled={isBotRunning}
                    className="w-full mt-3 bg-white text-sky-700 text-xs font-bold py-2.5 rounded-lg transition-all active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {isBotRunning ? 'Processing...' : 'Start Search'}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={triggerBot}
                  disabled={isBotRunning}
                  className="w-full h-10 flex items-center justify-center cursor-pointer"
                >
                  <Rocket className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-sky-600 shadow-sm cursor-pointer"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : '-rotate-90'}`} />
          </button>
        </aside>

        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-sky-100">
            <div className="px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-sky-900 capitalize">
                  {activeTab === 'tracker' ? 'Applications' : activeTab}
                </h2>
                {loading && (
                  <div className="flex items-center gap-2 text-sky-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800">{profile.name}</p>
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 justify-end">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    System Online
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-sky-200/50">
                  {profile.name?.[0] || 'U'}
                </div>
              </div>
            </div>
          </header>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && <DashboardView stats={stats} jobs={jobs} loading={loading} onRefresh={fetchJobs} onTrigger={triggerBot} isBotRunning={isBotRunning} />}
              {activeTab === 'jobs' && <JobsView jobs={filteredJobs} loading={loading} onRefresh={fetchJobs} onReview={(job) => { setSelectedJob(job); setAtsData(null); setMatchData(null); setReviewMode(true); }} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />}
              {activeTab === 'tracker' && <TrackerView jobs={jobs} stats={trackerStats} onUpdateStatus={updateJobStatus} loading={loading} />}
              {activeTab === 'profile' && <ProfileView profile={profile} setProfile={setProfile} onSave={saveProfile} onSyncGitHub={syncGitHub} loading={loading} />}
              {activeTab === 'settings' && <SettingsView settings={appSettings} setSettings={setAppSettings} onSave={saveSettings} loading={loading} />}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {reviewMode && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm" onClick={() => setReviewMode(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-blue-50">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedJob.title}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> {selectedJob.company}
                  </p>
                </div>
                <button onClick={() => setReviewMode(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {(selectedJob.ats_score || selectedJob.match_score) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedJob.match_score && (
                      <ScoreCard type="match" score={selectedJob.match_score} />
                    )}
                    {selectedJob.ats_score && (
                      <ScoreCard type="ats" score={selectedJob.ats_score} />
                    )}
                  </div>
                )}
                
                {selectedJob.interview_prep && !selectedJob.ats_score && (
                  <button 
                    onClick={() => calculateScores(selectedJob)}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-200/50 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Award className="w-5 h-5" />} 
                    {loading ? 'Calculating...' : 'Calculate Scores'}
                  </button>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Cover Letter</label>
                  <textarea 
                    rows={10}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-slate-700 leading-relaxed resize-none"
                    value={selectedJob.cover_letter || ''}
                    onChange={(e) => setSelectedJob({...selectedJob, cover_letter: e.target.value})}
                  />
                </div>

                {selectedJob.interview_prep ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sky-500" />
                      Interview Prep
                    </h4>
                    <div className="space-y-3">
                      {formatInterviewPrep(selectedJob.interview_prep)}
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={generateAIReview}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200/50 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} 
                    {loading ? 'Generating...' : 'Generate AI Content'}
                  </button>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap gap-3 bg-slate-50">
                <button 
                  onClick={() => handleDownload('pdf')}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> PDF
                </button>
                <button 
                  onClick={() => handleDownload('word')}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Word
                </button>
                <a 
                  href={selectedJob.link} 
                  target="_blank"
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" /> View Job
                </a>
                <button 
                  onClick={() => handleApply(selectedJob)}
                  disabled={loading || !selectedJob.email}
                  className={`flex-1 py-2.5 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedJob.email 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-200/50 hover:from-emerald-600 hover:to-green-600' 
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" /> 
                  {selectedJob.email ? 'Send Application' : 'No Email'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ScoreCard = ({ type, score }) => {
  const colors = getScoreColor(score);
  const label = type === 'match' ? 'Job Match' : 'ATS Score';
  const desc = type === 'match' ? 'Profile compatibility' : 'Resume optimization';
  
  return (
    <div className={`${colors.bg} p-4 rounded-xl border ${colors.ring} ring-1`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-slate-600">{label}</span>
        <span className={`text-2xl font-black ${colors.text}`}>{score}%</span>
      </div>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  );
};

const DashboardView = ({ stats, jobs, loading, onRefresh, onTrigger, isBotRunning }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 rounded-2xl p-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-10 -mb-10"></div>
      <div className="relative z-10">
        <h3 className="text-2xl font-bold mb-2">Welcome back!</h3>
        <p className="text-sky-100 max-w-lg">Your AI-powered job search assistant is working 24/7 to find and apply to the best opportunities for you.</p>
        <button 
          onClick={onTrigger} 
          disabled={isBotRunning}
          className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {isBotRunning ? 'Searching...' : 'Start New Search'}
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Leads" value={stats.found} icon={Briefcase} color="sky" />
      <StatCard label="Applications" value={stats.applied} icon={Send} color="emerald" />
      <StatCard label="Pending" value={stats.pending} icon={Clock} color="amber" />
      <StatCard label="CVs Generated" value={stats.generated} icon={FileText} color="violet" />
    </div>

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800">Recent Opportunities</h3>
        <button onClick={onRefresh} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer">
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {jobs.length === 0 ? (
          <EmptyState message="No jobs found yet. Start a search to find opportunities!" />
        ) : (
          jobs.slice(0, 5).map(job => (
            <div key={job.$id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-slate-800">{job.title}</h5>
                  <p className="text-sm text-slate-500">{job.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {job.match_score && (
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getScoreColor(job.match_score).bg} ${getScoreColor(job.match_score).text}`}>
                    {job.match_score}%
                  </span>
                )}
                <a href={job.link} target="_blank" className="p-2 text-slate-300 group-hover:text-sky-600 transition-colors cursor-pointer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </motion.div>
);

const JobsView = ({ jobs, loading, onRefresh, onReview, statusFilter, setStatusFilter }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'pending', 'applied', 'responses', 'interviews'].map(filter => (
          <button 
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              statusFilter === filter 
                ? 'bg-sky-100 text-sky-700' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>
      <button onClick={onRefresh} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer">
        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {jobs.length === 0 ? (
        <EmptyState message="No jobs match your filter. Try adjusting or start a new search." />
      ) : (
        <div className="divide-y divide-slate-100">
          {jobs.map(job => (
            <div key={job.$id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer" onClick={() => onReview(job)}>
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center text-sky-600 flex-shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-semibold text-slate-800 truncate">{job.title}</h5>
                    <p className="text-sm text-slate-500">{job.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {job.match_score && (
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getScoreColor(job.match_score).bg} ${getScoreColor(job.match_score).text}`}>
                      {job.match_score}% match
                    </span>
                  )}
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${job.applied ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {job.applied ? 'Applied' : 'Draft'}
                  </span>
                  <span className="text-sm text-slate-400 hidden sm:block">{new Date(job.$createdAt).toLocaleDateString()}</span>
                  <button 
                    onClick={() => onReview(job)}
                    className="px-3 py-1.5 text-sky-600 hover:bg-sky-50 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    Review
                  </button>
                  <a 
                    href={job.link} 
                    target="_blank"
                    onClick={e => e.stopPropagation()}
                    className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                    title="View on site"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </motion.div>
);

const TrackerView = ({ jobs, stats, onUpdateStatus, loading }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <TrackerStat label="Total" value={stats.total} color="slate" />
      <TrackerStat label="Draft" value={stats.draft} color="amber" />
      <TrackerStat label="Sent" value={stats.sent} color="sky" />
      <TrackerStat label="Responses" value={stats.responses} color="violet" />
      <TrackerStat label="Interviews" value={stats.interviews} color="emerald" />
    </div>

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {jobs.filter(j => j.applied || j.status === 'draft').length === 0 ? (
        <EmptyState message="No applications to track yet. Start applying to jobs!" />
      ) : (
        <div className="divide-y divide-slate-100">
          {jobs.filter(j => j.applied || j.status === 'draft').map(job => (
            <div key={job.$id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-slate-800">{job.company}</h5>
                  <p className="text-sm text-slate-500">{job.title}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${job.status === 'sent' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>
                    {job.status?.toUpperCase() || 'DRAFT'}
                  </span>
                  <select 
                    value={job.response_status || 'pending'}
                    onChange={(e) => onUpdateStatus(job.$id, { response_status: e.target.value, response_date: new Date().toISOString().split('T')[0] })}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border-0 cursor-pointer ${
                      job.response_status === 'rejected' ? 'bg-red-100 text-red-700' :
                      job.response_status === 'interview' ? 'bg-violet-100 text-violet-700' :
                      job.response_status === 'offer' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {['pending', 'rejected', 'interview', 'offer'].map(opt => (
                      <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                    ))}
                  </select>
                  {job.interview_date && (
                    <div className="flex items-center gap-2 text-violet-600 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{new Date(job.interview_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </motion.div>
);

const ProfileView = ({ profile, setProfile, onSave, onSyncGitHub, loading }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Master CV</h3>
            <p className="text-sm text-slate-500 mt-1">Your master profile data used to generate tailored resumes</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onSyncGitHub} className="px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-white transition-all flex items-center gap-2 cursor-pointer">
              <Github className="w-4 h-4" /> Sync GitHub
            </button>
            <button onClick={onSave} disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-200/50 hover:from-sky-600 hover:to-blue-600 transition-all disabled:opacity-50 cursor-pointer">
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField icon={UserCircle} label="Full Name" value={profile.name} onChange={v => setProfile({...profile, name: v})} />
          <FormField icon={Mail} label="Email" type="email" value={profile.email} onChange={v => setProfile({...profile, email: v})} />
          <FormField icon={Phone} label="Phone" value={profile.phone} onChange={v => setProfile({...profile, phone: v})} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField icon={MapPin} label="Location" value={profile.location} onChange={v => setProfile({...profile, location: v})} />
          <FormField icon={BriefcaseBusiness} label="Job Title" value={profile.title} onChange={v => setProfile({...profile, title: v})} />
          <FormField icon={Linkedin} label="LinkedIn" value={profile.linkedin} onChange={v => setProfile({...profile, linkedin: v})} placeholder="linkedin.com/in/username" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField icon={Github} label="GitHub" value={profile.github} onChange={v => setProfile({...profile, github: v})} placeholder="github.com/username" />
          <FormField icon={Globe} label="Portfolio" value={profile.portfolio} onChange={v => setProfile({...profile, portfolio: v})} placeholder="yourwebsite.com" />
        </div>

        <TextAreaField icon={FileText} label="Professional Summary" value={profile.summary} onChange={v => setProfile({...profile, summary: v})} rows={3} placeholder="A compelling 2-3 sentence summary..." />

        <TextAreaField icon={Zap} label="Technical Skills" value={profile.skills} onChange={v => setProfile({...profile, skills: v})} rows={2} placeholder="JavaScript, React, Node.js, Python..." />

        <TextAreaField icon={Briefcase} label="Work Experience" value={profile.work_history} onChange={v => setProfile({...profile, work_history: v})} rows={5} placeholder="Job Title at Company | Duration | Achievement 1; Achievement 2..." />

        <TextAreaField icon={Rocket} label="Projects" value={profile.projects} onChange={v => setProfile({...profile, projects: v})} rows={3} placeholder="Project Name: Description - Technologies used..." />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextAreaField icon={GraduationCap} label="Education" value={profile.education} onChange={v => setProfile({...profile, education: v})} rows={2} placeholder="Degree, Institution, Year" />
          <TextAreaField icon={Award} label="Certifications" value={profile.certifications} onChange={v => setProfile({...profile, certifications: v})} rows={2} placeholder="AWS Certified, Google Cloud..." />
        </div>

        <TextAreaField icon={Languages} label="Languages" value={profile.languages} onChange={v => setProfile({...profile, languages: v})} rows={1} placeholder="English (Native), Yoruba (Fluent)..." />
      </div>
    </div>
  </motion.div>
);

const SettingsView = ({ settings, setSettings, onSave, loading }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100">
        <h3 className="text-xl font-bold text-slate-800">Configuration</h3>
        <p className="text-sm text-slate-500 mt-1">Bot settings and preferences</p>
      </div>
      <form onSubmit={onSave} className="p-8 space-y-6">
        <FormField icon={Search} label="Job Search Keywords" value={settings.keywords} onChange={v => setSettings({...settings, keywords: v})} placeholder="Web Developer, React, Node.js" />
        <FormField icon={Mail} label="Gmail User" value={settings.gmail_user} onChange={v => setSettings({...settings, gmail_user: v})} />
        <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold rounded-xl hover:from-slate-900 hover:to-black transition-all disabled:opacity-50 cursor-pointer">
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  </motion.div>
);

const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    sky: 'bg-sky-100 text-sky-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    violet: 'bg-violet-100 text-violet-600'
  };
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
};

const TrackerStat = ({ label, value, color }) => {
  const colors = {
    slate: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-100 text-amber-700',
    sky: 'bg-sky-100 text-sky-700',
    violet: 'bg-violet-100 text-violet-700',
    emerald: 'bg-emerald-100 text-emerald-700'
  };
  
  return (
    <div className={`${colors[color]} rounded-xl p-4`}>
      <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};

const FormField = ({ icon: Icon, label, value, onChange, placeholder = "", type = "text" }) => (
  <div>
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
      {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      {label}
    </label>
    <input 
      type={type} 
      value={value || ''} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-slate-700" 
    />
  </div>
);

const TextAreaField = ({ icon: Icon, label, value, onChange, rows = 3, placeholder = "" }) => (
  <div>
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
      {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      {label}
    </label>
    <textarea 
      rows={rows} 
      value={value || ''} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-slate-700 resize-none" 
    />
  </div>
);

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
      <Briefcase className="w-8 h-8" />
    </div>
    <p className="text-slate-500 font-medium">{message}</p>
  </div>
);

export default App;

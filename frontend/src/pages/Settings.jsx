import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [dbUri, setDbUri] = useState('mongodb://127.0.0.1:27017/speechtotext');
  const [dbName, setDbName] = useState('speechtotext');
  const [showUri, setShowUri] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const [prefs, setPrefs] = useState({
    smartFormat: true,
    punctuation: true,
    detectLanguage: true,
    saveTimestamps: true,
  });

  const handleTestConnection = () => {
    setIsTesting(true);
    // Mock connection testing
    setTimeout(() => {
      setIsTesting(false);
      toast.success('Connected to MongoDB successfully!');
    }, 1500);
  };

  const togglePref = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-8 animate-fade-in pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-soft-white mb-2">Settings</h1>
        <p className="text-muted-text">Manage your preferences and connections</p>
      </div>

      {/* MongoDB Storage Card */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-6 text-soft-white border-b border-white/5 pb-4 flex items-center justify-between">
          MongoDB Connection
          <span className="text-[10px] uppercase font-bold tracking-wider bg-badge-green/20 text-badge-green border border-badge-green/30 px-3 py-1 rounded-full">Active</span>
        </h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted-text mb-2">MongoDB URI</label>
            <div className="flex gap-2 relative">
              <input 
                type={showUri ? "text" : "password"}
                value={dbUri}
                onChange={(e) => setDbUri(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-soft-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm transition-all"
              />
              <button onClick={() => setShowUri(!showUri)} className="absolute right-4 top-3.5 text-muted-text text-sm hover:text-soft-white font-medium">
                {showUri ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-text mb-2">Database Name</label>
              <input 
                type="text"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-soft-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-text mb-2">Auto-delete after</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-soft-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm appearance-none cursor-pointer transition-all">
                <option className="bg-background-dark">Never</option>
                <option className="bg-background-dark">7 days</option>
                <option className="bg-background-dark">30 days</option>
                <option className="bg-background-dark">90 days</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 mt-6">
            <button 
              className="bg-badge-green/10 hover:bg-badge-green/20 text-badge-green border border-badge-green/30 px-6 py-2.5 rounded-xl transition-colors text-sm font-semibold flex items-center justify-center gap-2"
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? 'Testing Configuration...' : 'Test Connection'}
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-6 text-soft-white border-b border-white/5 pb-4">
          Transcription Preferences
        </h2>

        <div className="space-y-6">
          <PreferenceRow 
            title="Smart Formatting" 
            desc="Automatically format dates, numbers, and currencies" 
            active={prefs.smartFormat} 
            onClick={() => togglePref('smartFormat')} 
          />
          <PreferenceRow 
            title="Punctuation" 
            desc="Add commas, periods, and question marks" 
            active={prefs.punctuation} 
            onClick={() => togglePref('punctuation')} 
          />
          <PreferenceRow 
            title="Detect Language Automatically" 
            desc="Autodetect spoken language during transcription" 
            active={prefs.detectLanguage} 
            onClick={() => togglePref('detectLanguage')} 
          />
          <PreferenceRow 
            title="Save Word Timestamps" 
            desc="Store start and end times for every transcribed word" 
            active={prefs.saveTimestamps} 
            onClick={() => togglePref('saveTimestamps')} 
          />
          
          <div className="pt-6 border-t border-white/5">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-soft-white">
                Max File Size
              </label>
              <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-muted-text">50 MB</span>
            </div>
            <input type="range" min="10" max="100" defaultValue="50" className="w-full h-2 rounded-full appearance-none bg-white/10 outline-none hover:bg-white/20 transition-colors" />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-badge-red/20 bg-badge-red/5 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-badge-red"></div>
        <h2 className="text-lg font-bold mb-2 text-badge-red flex items-center gap-2">
          Danger Zone
        </h2>
        <p className="text-xs text-muted-text mb-6">These actions are irreversible and will permanently delete data.</p>
        
        <div className="flex gap-4">
          <button className="px-6 py-2.5 bg-badge-red/10 border border-badge-red/30 text-badge-red hover:bg-badge-red hover:text-white rounded-xl transition-colors text-sm font-bold shadow-sm">
            Delete All Transcriptions
          </button>
          <button className="px-6 py-2.5 bg-white/5 border border-white/10 text-muted-text hover:text-soft-white hover:bg-white/10 rounded-xl transition-colors text-sm font-bold shadow-sm">
            Reset All Settings
          </button>
        </div>
      </div>

    </div>
  );
}

function PreferenceRow({ title, desc, active, onClick }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-soft-white text-sm font-semibold">{title}</h4>
        <p className="text-xs text-muted-text mt-1">{desc}</p>
      </div>
      <div 
        onClick={onClick}
        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${active ? 'bg-primary' : 'bg-surface border border-white/10'}`}
      >
        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${active ? 'translate-x-6' : 'translate-x-0 opacity-50'}`} />
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTranscriptions, deleteTranscription } from '../api/transcription';

export default function History() {
  const navigate = useNavigate();
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  const fetchTranscriptions = async () => {
    try {
      const { data } = await getTranscriptions(1, 50); // Get more for history page
      setTranscriptions(data || []);
    } catch (error) {
      toast.error('Failed to load transcriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete transcription permanently?')) return;
    try {
      await deleteTranscription(id);
      setTranscriptions(t => t.filter(x => x._id !== id));
      toast.success('Deleted successfully');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const filtered = transcriptions.filter(t => 
    t.originalName.toLowerCase().includes(search.toLowerCase()) || 
    (t.transcript && t.transcript.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-soft-white">Transcriptions History</h1>
          <p className="text-muted-text mt-2">All your processed audio files</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-muted-text" size={18} />
          <input 
            type="text" 
            placeholder="Search transcriptions..." 
            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm w-64 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-soft-white transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-muted-text">
            <Loader2 className="animate-spin mr-2" /> Loading transcriptions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-text">
            No transcriptions found. 
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-muted-text text-xs uppercase tracking-wider font-semibold bg-white/5">
                <th className="p-4 px-6">Filename</th>
                <th className="p-4">Date</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Confidence</th>
                <th className="p-4 text-right px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr 
                  key={item._id} 
                  className="border-b border-white/5 hover:bg-primary/5 cursor-pointer transition-colors group"
                  onClick={() => navigate(`/transcription/${item._id}`)}
                >
                  <td className="p-4 px-6 py-5">
                    <div className="font-bold text-sm text-soft-white">{item.originalName}</div>
                    <div className="text-xs text-muted-text truncate max-w-xs mt-1">{item.transcript || 'Processing...'}</div>
                  </td>
                  <td className="p-4 text-sm text-muted-text font-medium">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm text-muted-text font-medium">
                    {Math.round(item.duration)}s
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-full border
                      ${item.confidence > 0.9 ? 'text-badge-green bg-badge-green/10 border-badge-green/20' 
                        : item.confidence > 0.7 ? 'text-badge-amber bg-badge-amber/10 border-badge-amber/20' 
                        : 'text-badge-red bg-badge-red/10 border-badge-red/20'}`}>
                      {Math.round(item.confidence * 100)}% Match
                    </span>
                  </td>
                  <td className="p-4 text-right px-6">
                    <button 
                      className="text-muted-text hover:text-badge-red p-2 transition-colors rounded-lg hover:bg-badge-red/10 opacity-0 group-hover:opacity-100"
                      onClick={(e) => handleDelete(e, item._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

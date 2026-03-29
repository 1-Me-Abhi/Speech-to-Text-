import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Copy, Download, Trash2, ChevronRight, Play, Server, Clock, Text, HardDrive, FileText } from 'lucide-react';
import { getTranscription, deleteTranscription } from '../api/transcription';

export default function TranscriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await getTranscription(id);
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load transcription details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data?.transcript || '');
    toast.success('Copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([data?.transcript || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data?.originalName.split('.')[0]}_transcript.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this transcription?')) return;
    try {
      await deleteTranscription(id);
      toast.success('Deleted successfully');
      navigate('/history');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="p-12 text-center text-muted-text animate-pulse">Loading details...</div>;
  if (!data) return <div className="p-12 text-center text-muted-text">Not found</div>;

  const confPercent = Math.round(data.confidence * 100);
  const confBadgeColor = confPercent > 90 ? 'text-badge-green bg-badge-green/10' : confPercent > 70 ? 'text-badge-amber bg-badge-amber/10' : 'text-badge-red bg-badge-red/10';

  const formatSecs = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  
  // Simulated word timeline rendering since actual audio is discarded on backend (in current setup)
  // For a real player, we'd need to store the audio blob in S3/MongoDB GridFS
  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-8 animate-fade-in">
      
      {/* Breadcrumb */}
      <div className="flex items-center text-sm font-medium text-muted-text space-x-2">
        <button onClick={() => navigate('/')} className="hover:text-soft-white transition-colors">Dashboard</button>
        <ChevronRight size={14} className="opacity-50" />
        <button onClick={() => navigate('/history')} className="hover:text-soft-white transition-colors">Transcriptions</button>
        <ChevronRight size={14} className="opacity-50" />
        <span className="text-primary truncate max-w-[200px] block font-semibold">{data.originalName}</span>
      </div>

      {/* Hero Stats Card */}
      <div className="glass-card rounded-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Audio Player UI Mock */}
        <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-white/5 bg-white/2 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold break-all mb-1 font-mono text-soft-white">{data.originalName}</h2>
            <p className="text-sm text-muted-text/80 mb-8">{new Date(data.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>
          
          <div className="w-full">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono text-primary font-bold">0:00</span>
              <span className="text-xs font-mono text-muted-text">{formatSecs(data.duration)}</span>
            </div>
            
            <div className="h-1.5 bg-background-dark/50 rounded-full w-full mb-6 relative overflow-hidden border border-white/5">
               <div className="absolute top-0 left-0 h-full w-[30%] bg-primary rounded-full relative"></div>
            </div>

            <div className="flex justify-center">
              <button disabled className="w-14 h-14 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center cursor-not-allowed hover:bg-primary/30 transition-colors" title="Audio streaming not enabled in MVP">
                <Play size={24} className="ml-1 fill-primary opacity-80" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Stats Panel */}
        <div className="p-8 w-full md:w-[350px] flex flex-col justify-between bg-surface">
          <div className="space-y-5 mb-8">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-muted-text flex items-center gap-2"><Server size={14} className="opacity-70"/> Confidence</span>
              <span className={`text-[10px] uppercase font-bold px-2.5 py-1.5 rounded-full ${confBadgeColor}`}>{confPercent}% Match</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-muted-text flex items-center gap-2"><Text size={14} className="opacity-70"/> Words</span>
              <span className="text-sm font-semibold text-soft-white">{data.words?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-muted-text flex items-center gap-2"><Clock size={14} className="opacity-70"/> Duration</span>
              <span className="text-sm font-semibold text-soft-white">{formatSecs(data.duration)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-muted-text flex items-center gap-2"><HardDrive size={14} className="opacity-70"/> Size</span>
              <span className="text-sm font-semibold text-soft-white">{(data.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-soft-white transition-colors py-2.5 rounded-xl font-semibold flex justify-center items-center gap-2 text-xs uppercase tracking-wider text-muted-text" onClick={handleCopy}>
              <Copy size={14} /> Copy
            </button>
            <button className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-soft-white transition-colors py-2.5 rounded-xl font-semibold flex justify-center items-center gap-2 text-xs uppercase tracking-wider text-muted-text" onClick={handleDownload}>
              <Download size={14} /> TXT
            </button>
            <button className="p-2.5 border border-badge-red/20 bg-badge-red/10 text-badge-red hover:bg-badge-red hover:text-white transition-colors rounded-xl" onClick={handleDelete} title="Delete">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Transcription Content */}
      <div className="glass-card p-8 lg:p-10 rounded-2xl relative overflow-hidden group">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-soft-white border-b border-white/5 pb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center"><FileText size={16} /></div> 
          Final Output
        </h3>
        
        {data.words && data.words.length > 0 ? (
          <div className="leading-loose text-lg text-muted-text font-medium relative z-10">
            {data.words.map((w, i) => (
              <span 
                key={i} 
                title={`${w.confidence * 100}% Conf`}
                className={`mr-[4px] inline-block transition-colors
                  ${w.confidence < 0.8 ? 'border-b-2 border-dashed border-badge-amber/50 text-soft-white' : ''}
                  ${w.confidence < 0.5 ? 'border-badge-red/50 text-badge-red' : ''}
                  hover:bg-primary/20 hover:text-primary rounded cursor-text
                `}
              >
                {w.word}
              </span>
            ))}
          </div>
        ) : (
          <p className="leading-loose text-lg text-muted-text font-medium relative z-10 whitespace-pre-wrap">
            {data.transcript}
          </p>
        )}
      </div>

    </div>
  );
}

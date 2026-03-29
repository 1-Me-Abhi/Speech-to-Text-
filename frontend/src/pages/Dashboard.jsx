import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mic, CloudUpload, Play, FileText, Trash2, ArrowRight, Settings } from 'lucide-react';
import useAudioRecorder from '../hooks/useAudioRecorder';
import { transcribeAudio, getTranscriptions, deleteTranscription } from '../api/transcription';
import WaveformBars from '../components/WaveformBars';

export default function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [transcriptions, setTranscriptions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    isRecording,
    recordingTime,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    clearRecording,
    formatTime,
  } = useAudioRecorder();

  useEffect(() => {
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    try {
      const { data } = await getTranscriptions(1, 3);
      setTranscriptions(data || []);
    } catch (error) {
      toast.error('Failed to load recent transcriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processAudio(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTranscribeRecorded = async () => {
    if (!audioBlob) return;
    const file = new File([audioBlob], `recording-${Date.now()}.webm`, { type: audioBlob.type });
    await processAudio(file);
    clearRecording();
  };

  const processAudio = async (file) => {
    const formData = new FormData();
    formData.append('audio', file);
    
    setUploading(true);
    const loadingToast = toast.loading('Transcribing audio with Deepgram...');
    
    try {
      const res = await transcribeAudio(formData);
      toast.success('Transcription completed!');
      navigate(`/transcription/${res.data._id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to transcribe audio.');
    } finally {
      toast.dismiss(loadingToast);
      setUploading(false);
      fetchRecent();
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete transcription?')) return;
    try {
      await deleteTranscription(id);
      setTranscriptions(t => t.filter(x => x._id !== id));
      toast.success('Deleted successfully');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full animate-fade-in">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-medium text-muted-text">Workspace Overview</h2>
        <div className="flex items-center gap-4">
          <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 text-muted-text hover:text-soft-white border border-white/10 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="glass-card rounded-3xl p-8 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-3 text-soft-white">Convert Speech to Text Instantly</h2>
            <p className="text-muted-text mb-8 max-w-md leading-relaxed">
              Professional-grade accuracy. Upload audio files or record live with real-time feedback powered by Deepgram AI.
            </p>
            
            <div className="flex flex-wrap gap-4">
              {isRecording ? (
                <button 
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-badge-red text-soft-white rounded-xl font-semibold transition-all hover:brightness-110 shadow-sm"
                >
                  <div className="w-3 h-3 bg-white rounded-sm animate-pulse mr-1"></div>
                  <span className="text-sm">Stop ({formatTime(recordingTime)})</span>
                  <div className="ml-2">
                    <WaveformBars bars={4} active={true} />
                  </div>
                </button>
              ) : audioUrl ? (
                <div className="flex flex-col gap-3">
                   <audio src={audioUrl} controls className="h-10 w-64" />
                   <div className="flex gap-2">
                     <button onClick={handleTranscribeRecorded} disabled={uploading} className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all text-sm w-full">
                       <FileText size={16} /> Transcribe
                     </button>
                     <button onClick={clearRecording} className="px-4 py-3 bg-white/5 border border-white/10 text-muted-text hover:text-soft-white rounded-xl transition-colors">
                       Discard
                     </button>
                   </div>
                </div>
              ) : (
                <button 
                  onClick={startRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-badge-red text-soft-white rounded-xl font-semibold transition-all hover:brightness-110 shadow-sm"
                >
                  <Mic size={16} className="text-white" />
                  <span className="text-sm">Record Live</span>
                </button>
              )}
              
              {!audioUrl && !isRecording && (
                <button 
                  onClick={() => navigate('/history')}
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-sm transition-all text-soft-white"
                >
                  <FileText size={16} />
                  <span>Recent Activity</span>
                </button>
              )}
            </div>
          </div>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-colors group h-full min-h-[200px]"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <CloudUpload size={32} className="text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-1 text-soft-white">{uploading ? 'Uploading...' : 'Upload Audio File'}</h3>
            <p className="text-xs text-muted-text">Drag and drop MP3, WAV, or MP4 here</p>
            <span className="mt-4 text-[10px] font-bold tracking-wider uppercase text-primary/80 px-3 py-1 bg-primary/10 rounded-full">Max file size: 50MB</span>
            <input
              type="file"
              className="hidden"
              accept="audio/*"
              ref={fileInputRef}
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </div>
        </div>
      </section>

      {/* Recent Transcriptions Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-soft-white">Recent Transcriptions</h3>
          <button 
            onClick={() => navigate('/history')}
            className="text-xs text-primary hover:text-primary/80 font-semibold cursor-pointer"
          >
            View all activity
          </button>
        </div>
        
        {loading ? (
            <p className="text-muted-text">Loading activity...</p>
        ) : transcriptions.length === 0 ? (
            <div className="bg-white/2 border border-white/5 rounded-2xl p-8 text-center text-muted-text">
                No recent transcriptions. Upload an audio file to get started.
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {transcriptions.map((item, idx) => (
              <div key={item._id} className="bg-white/2 border border-white/5 rounded-2xl p-5 hover:border-primary/30 transition-all flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 w-full">
                    {/* Dynamic logo color based on index */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                        ${idx % 3 === 0 ? 'bg-blue-500/10 text-blue-400/80' : 
                          idx % 3 === 1 ? 'bg-accent-muted/10 text-accent-muted' : 
                          'bg-slate-500/10 text-slate-400'}
                    `}>
                      {idx % 3 === 0 ? <FileText size={20} /> : idx % 3 === 1 ? <Mic size={20} /> : <Play size={20} />}
                    </div>
                    <div className="min-w-0 flex-1 pr-2">
                       <h4 className="font-bold text-xs truncate text-soft-white" title={item.originalName}>{item.originalName}</h4>
                       <p className="text-[10px] text-muted-text">{new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 items-center">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border
                      ${item.confidence > 0.9 ? 'bg-badge-green/10 text-badge-green border-badge-green/20' : 
                        item.confidence > 0.7 ? 'bg-badge-amber/10 text-badge-amber border-badge-amber/20' : 
                        'bg-badge-red/10 text-badge-red border-badge-red/20'}`}
                    >
                      {Math.round(item.confidence * 100)}%
                    </span>
                    <button 
                       onClick={(e) => handleDelete(e, item._id)}
                       className="text-muted-text/40 hover:text-badge-red transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-muted-text/80 line-clamp-2 mb-4 leading-relaxed flex-1">
                  "{item.transcript || "Transcription processing..."}"
                </p>
                
                <button 
                  onClick={() => navigate(`/transcription/${item._id}`)}
                  className="w-full py-2 bg-white/5 rounded-lg text-[10px] font-bold text-soft-white hover:bg-primary/20 hover:text-primary transition-colors uppercase tracking-wider mt-auto"
                >
                  Open Transcription
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

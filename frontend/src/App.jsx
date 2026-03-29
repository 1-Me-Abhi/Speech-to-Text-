import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import UploadPage from './pages/Upload';
import Settings from './pages/Settings';
import TranscriptionDetail from './pages/TranscriptionDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="history" element={<History />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="settings" element={<Settings />} />
        <Route path="transcription/:id" element={<TranscriptionDetail />} />
      </Route>
    </Routes>
  );
}

export default App;

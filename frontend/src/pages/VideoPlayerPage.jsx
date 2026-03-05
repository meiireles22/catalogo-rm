import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const VideoPlayerPage = ({ onLogout }) => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    const savedVideos = localStorage.getItem('galeriaVideos');
    if (savedVideos) {
      const videos = JSON.parse(savedVideos);
      const found = videos.find(v => v.id === videoId);
      setVideo(found);
    }
  }, [videoId]);

  if (!video) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">Vídeo não encontrado</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-black flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate('/videos')}
            className="p-3 text-white hover:bg-white/10 rounded-full transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <h1 className="text-xl font-bold text-white font-['Oswald'] uppercase tracking-wide">
            {video.title}
          </h1>
        </div>
        <motion.button
          onClick={() => navigate('/videos')}
          className="p-3 text-white hover:bg-white/10 rounded-full transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="w-6 h-6" />
        </motion.button>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        {video.type === 'mp4' ? (
          <motion.video
            src={video.url}
            className="w-full h-full max-h-[90vh] object-contain rounded-sm"
            controls
            autoPlay
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <motion.div 
            className="w-full max-w-6xl aspect-video"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${video.url}?autoplay=1&rel=0`}
              title={video.title}
              className="w-full h-full rounded-sm"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        )}
      </div>

      <footer className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-black/80 to-transparent text-center">
        <p className="text-zinc-500 text-sm">© 2026 Ribeiro & Moreira - Metal Services</p>
      </footer>
    </motion.div>
  );
};

export default VideoPlayerPage;
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, LogOut, Play, User, Plus, Pencil, Trash2, X, Save, Check, AlertTriangle, Link, Video, Camera, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const VIDEOS_INICIAL = [
  { id: 'video-1', title: 'Corte Laser - Demonstração', url: 'https://customer-assets.emergentagent.com/job_quotation-view/artifacts/mg41ibw6_VideoLaser.mp4', type: 'mp4' },
  { id: 'video-2', title: 'Corte Laser - Precisão', url: 'https://customer-assets.emergentagent.com/job_quotation-view/artifacts/w4royh0r_VideoLaser2.mp4', type: 'mp4' },
  { id: 'video-3', title: 'Corte Laser - Produção', url: 'https://customer-assets.emergentagent.com/job_quotation-view/artifacts/rrvj9pnm_VideoLaser3.mp4', type: 'mp4' },
  { id: 'video-4', title: 'Ribeiro & Moreira - Apresentação', url: 'Kicotda5iCg', type: 'youtube' }
];

const VideoGalleryPage = ({ onLogout, isAdmin, username }) => {
  const navigate = useNavigate();
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [newVideo, setNewVideo] = useState({ title: '', url: '', type: 'youtube', file: null });
  const [videoPreview, setVideoPreview] = useState('');
  const [inputMethod, setInputMethod] = useState('url');
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmPopupData, setConfirmPopupData] = useState({});
  
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        const savedVideos = localStorage.getItem('galeriaVideos');
        if (savedVideos) {
          setVideos(JSON.parse(savedVideos));
        } else {
          setVideos(VIDEOS_INICIAL);
          localStorage.setItem('galeriaVideos', JSON.stringify(VIDEOS_INICIAL));
        }
      } catch (error) {
        console.error('Erro ao carregar vídeos:', error);
        setVideos(VIDEOS_INICIAL);
      } finally {
        setLoading(false);
      }
    };
    loadVideos();
  }, []);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessPopup(true);
    setTimeout(() => setShowSuccessPopup(false), 2000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorPopup(true);
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmPopupData({ title, message, onConfirm });
    setShowConfirmPopup(true);
  };

  const extractYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  const openAddModal = () => {
    setEditingVideo(null);
    setNewVideo({ title: '', url: '', type: 'youtube', file: null });
    setVideoPreview('');
    setInputMethod('url');
    setShowModal(true);
  };

  const openEditModal = (video) => {
    setEditingVideo(video);
    setNewVideo({ 
      title: video.title, 
      url: video.type === 'youtube' ? `https://youtu.be/${video.url}` : video.url, 
      type: video.type,
      file: null
    });
    setVideoPreview(video.type === 'mp4' && !video.url.startsWith('data:') ? video.url : '');
    setInputMethod(video.type === 'youtube' ? 'url' : 'file');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVideo(null);
    setNewVideo({ title: '', url: '', type: 'youtube', file: null });
    setVideoPreview('');
    setInputMethod('url');
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        showError('Vídeo muito grande! Máximo 50MB. Para vídeos maiores, use o YouTube.');
        return;
      }
      if (!file.type.startsWith('video/')) {
        showError('Por favor selecione um ficheiro de vídeo válido');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setVideoPreview(base64);
        setNewVideo({...newVideo, url: base64, type: 'mp4', file: file});
        setInputMethod('file');
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmSaveVideo = () => {
    if (!newVideo.title) {
      showError('Preenche o título do vídeo');
      return;
    }
    if (!newVideo.url && !videoPreview) {
      showError('Adiciona um URL ou seleciona um vídeo');
      return;
    }
    showConfirm(
      editingVideo ? 'Guardar Alterações' : 'Adicionar Vídeo',
      editingVideo 
        ? `Tem a certeza que deseja guardar as alterações do vídeo "${newVideo.title}"?`
        : `Tem a certeza que deseja adicionar o vídeo "${newVideo.title}"?`,
      handleSaveVideo
    );
  };

  const handleSaveVideo = () => {
    setShowConfirmPopup(false);
    let processedUrl = newVideo.url || videoPreview;
    let videoType = newVideo.type;
    
    if (inputMethod === 'url' && (newVideo.url.includes('youtube') || newVideo.url.includes('youtu.be'))) {
      videoType = 'youtube';
      processedUrl = extractYoutubeId(newVideo.url);
    } else if (inputMethod === 'file' || newVideo.url.includes('.mp4') || newVideo.url.startsWith('data:video')) {
      videoType = 'mp4';
    }
    
    let updatedVideos;
    if (editingVideo) {
      updatedVideos = videos.map(v => v.id === editingVideo.id ? { ...v, title: newVideo.title, url: processedUrl, type: videoType } : v);
      showSuccess('Vídeo actualizado com sucesso!');
    } else {
      const newId = `video-${Date.now()}`;
      updatedVideos = [...videos, { id: newId, title: newVideo.title, url: processedUrl, type: videoType }];
      showSuccess('Vídeo adicionado com sucesso!');
    }
    
    setVideos(updatedVideos);
    setTimeout(() => {
      try {
        localStorage.setItem('galeriaVideos', JSON.stringify(updatedVideos));
      } catch (e) {
        showError('Erro ao guardar. O vídeo pode ser muito grande.');
      }
    }, 0);
    closeModal();
  };

  const openDeleteConfirm = (video) => {
    setVideoToDelete(video);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!videoToDelete) return;
    const updatedVideos = videos.filter(v => v.id !== videoToDelete.id);
    setVideos(updatedVideos);
    localStorage.setItem('galeriaVideos', JSON.stringify(updatedVideos));
    showSuccess('Vídeo eliminado com sucesso!');
    setShowDeleteConfirm(false);
    setVideoToDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">A carregar vídeos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/catalogo')} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img src="https://customer-assets.emergentagent.com/job_mostruario-metal/artifacts/dyyus9dq_LOGOTIPO_VERDE_ASSINATURA%20%28002%29.png" alt="Logo" className="h-8 object-contain cursor-pointer" onClick={() => navigate('/catalogo')} />
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-sm ${isAdmin ? 'bg-[#00c853]/20 text-[#00c853]' : 'bg-blue-500/20 text-blue-400'}`}>
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">{username}</span>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline uppercase text-sm tracking-wide">Sair</span>
          </button>
        </div>
      </header>

      <div className="relative h-48 md:h-64 bg-gradient-to-r from-red-900/50 to-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-white font-['Oswald'] uppercase tracking-wider flex items-center gap-4">
              <Play className="w-10 h-10 text-red-500" />
              Galeria de Vídeos
            </h1>
            <p className="text-zinc-300 mt-2 max-w-2xl">Veja os nossos processos de fabrico e equipamentos em ação.</p>
          </div>
          {isAdmin && (
            <button onClick={openAddModal} className="bg-red-600 hover:bg-red-500 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110" title="Adicionar Vídeo">
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <main className="flex-1 p-6 md:p-10">
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {videos.map((video, index) => (
            <motion.div 
              key={video.id} 
              className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden group relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              {isAdmin && (
                <div className="absolute top-3 right-3 z-10 flex gap-2">
                  <motion.button onClick={(e) => { e.stopPropagation(); openEditModal(video); }} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Pencil className="w-4 h-4" /></motion.button>
                  <motion.button onClick={(e) => { e.stopPropagation(); openDeleteConfirm(video); }} className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Trash2 className="w-4 h-4" /></motion.button>
                </div>
              )}
              <div className="cursor-pointer" onClick={() => navigate(`/videos/${video.id}`)}>
                <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                  {video.type === 'youtube' ? (
                    <img 
                      src={`https://img.youtube.com/vi/${video.url}/maxresdefault.jpg`}
                      alt={video.title} 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                      onError={(e) => { e.target.src = `https://img.youtube.com/vi/${video.url}/hqdefault.jpg`; }} 
                    />
                  ) : (
                    <video 
                      src={video.url} 
                      className="w-full h-full object-cover" 
                      muted 
                      preload="metadata"
                      onLoadedData={(e) => { e.target.currentTime = 0.1; }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <motion.div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </motion.div>
                  </div>
                  {video.type === 'youtube' && <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-sm">YouTube</div>}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white font-['Oswald'] uppercase tracking-wide">{video.title}</h3>
                  <p className="text-[#00c853] text-sm font-medium uppercase tracking-wide mt-2">Ver Vídeo</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {videos.length === 0 && (
          <div className="text-center py-20">
            <Video className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">Nenhum vídeo disponível.</p>
            {isAdmin && <button onClick={openAddModal} className="mt-4 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-sm">Adicionar Primeiro Vídeo</button>}
          </div>
        )}
      </main>

      {/* Popup de Sucesso */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div className="fixed top-4 right-4 z-[100] bg-[#00c853] text-black px-6 py-4 rounded-sm shadow-2xl flex items-center gap-3" initial={{ opacity: 0, x: 100, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 100, scale: 0.8 }} transition={{ type: "spring", duration: 0.5 }}>
            <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center"><Check className="w-5 h-5" /></div>
            <span className="font-bold">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup de Erro */}
      <AnimatePresence>
        {showErrorPopup && (
          <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[90] p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-zinc-900 border border-zinc-700 rounded-sm w-full max-w-md p-6" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <div className="flex justify-center mb-6"><div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-600/20"><AlertTriangle className="w-8 h-8 text-red-500" /></div></div>
              <h2 className="text-xl font-bold text-white text-center font-['Oswald'] uppercase tracking-wide mb-3">Erro</h2>
              <p className="text-zinc-300 text-center mb-8">{errorMessage}</p>
              <button onClick={() => setShowErrorPopup(false)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wide py-4 rounded-sm transition-all flex items-center justify-center gap-2"><Check className="w-5 h-5" />OK</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup de Confirmação */}
      <AnimatePresence>
        {showConfirmPopup && (
          <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[90] p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-zinc-900 border border-zinc-700 rounded-sm w-full max-w-md p-6" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <div className="flex justify-center mb-6"><div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-600/20"><Save className="w-8 h-8 text-blue-500" /></div></div>
              <h2 className="text-xl font-bold text-white text-center font-['Oswald'] uppercase tracking-wide mb-3">{confirmPopupData.title}</h2>
              <p className="text-zinc-300 text-center mb-8">{confirmPopupData.message}</p>
              <div className="flex gap-4">
                <button onClick={() => setShowConfirmPopup(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium uppercase tracking-wide py-4 rounded-sm transition-all border border-zinc-700">Cancelar</button>
                <button onClick={confirmPopupData.onConfirm} className="flex-1 bg-[#00c853] hover:bg-[#00e676] text-black font-bold uppercase tracking-wide py-4 rounded-sm transition-all flex items-center justify-center gap-2"><Check className="w-5 h-5" />Confirmar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup de Eliminação */}
      {showDeleteConfirm && videoToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div className="bg-zinc-900 border border-zinc-700 rounded-sm w-full max-w-md p-6" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="flex justify-center mb-6"><div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center"><AlertTriangle className="w-8 h-8 text-red-500" /></div></div>
            <h2 className="text-xl font-bold text-white text-center font-['Oswald'] uppercase tracking-wide mb-3">Confirmar Eliminação</h2>
            <p className="text-zinc-300 text-center mb-2">Tem a certeza de que pretende eliminar o vídeo</p>
            <p className="text-red-500 text-center font-bold text-lg mb-6">"{videoToDelete.title}"</p>
            <p className="text-zinc-500 text-center text-sm mb-8">Esta ação não poderá ser revertida.</p>
            <div className="flex gap-4">
              <button onClick={() => { setShowDeleteConfirm(false); setVideoToDelete(null); }} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium uppercase tracking-wide py-4 rounded-sm transition-all border border-zinc-700">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wide py-4 rounded-sm transition-all flex items-center justify-center gap-2"><Trash2 className="w-5 h-5" />Eliminar</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Adicionar/Editar */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div className="bg-zinc-900 border border-zinc-700 rounded-sm w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white font-['Oswald'] uppercase flex items-center gap-3"><Video className="w-6 h-6 text-red-500" />{editingVideo ? 'Editar Vídeo' : 'Novo Vídeo'}</h2>
              <button onClick={closeModal} className="text-zinc-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-sm mb-2 uppercase">Título do Vídeo *</label>
                <input type="text" value={newVideo.title} onChange={(e) => setNewVideo({...newVideo, title: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-4 py-3 text-white focus:border-red-500 focus:outline-none" placeholder="Ex: Corte Laser - Demonstração" />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-2 uppercase">Vídeo</label>
                <div className="aspect-video bg-zinc-800 rounded-sm overflow-hidden flex items-center justify-center border-2 border-dashed border-zinc-700">
                  {videoPreview ? (
                    <video src={videoPreview} className="w-full h-full object-cover" controls />
                  ) : newVideo.url && (newVideo.url.includes('youtube') || newVideo.url.includes('youtu.be')) ? (
                    <img src={`https://img.youtube.com/vi/${extractYoutubeId(newVideo.url)}/maxresdefault.jpg`} alt="YouTube Preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/640x360/1a1a1a/666?text=YouTube'; }} />
                  ) : (
                    <div className="text-center text-zinc-500"><Video className="w-12 h-12 mx-auto mb-2" /><p>Nenhum vídeo selecionado</p></div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input ref={cameraInputRef} type="file" accept="video/*" capture="environment" onChange={handleVideoSelect} className="hidden" />
                <input ref={galleryInputRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
                <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 py-3 px-4 rounded-sm border border-red-600/30 transition-colors"><Camera className="w-5 h-5" /><span>Gravar</span></button>
                <button type="button" onClick={() => galleryInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 py-3 px-4 rounded-sm border border-red-600/30 transition-colors"><Upload className="w-5 h-5" /><span>Galeria</span></button>
              </div>
              <div className="flex items-center gap-4"><div className="flex-1 h-px bg-zinc-700"></div><span className="text-zinc-500 text-sm">ou</span><div className="flex-1 h-px bg-zinc-700"></div></div>
              <div>
                <label className="block text-zinc-400 text-sm mb-2 uppercase">URL do YouTube</label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input type="text" value={inputMethod === 'url' ? newVideo.url : ''} onChange={(e) => { setNewVideo({...newVideo, url: e.target.value, type: 'youtube'}); setVideoPreview(''); setInputMethod('url'); }} className="w-full bg-zinc-800 border border-zinc-700 rounded-sm pl-12 pr-4 py-3 text-white focus:border-red-500 focus:outline-none" placeholder="https://youtu.be/..." />
                </div>
                <p className="text-zinc-500 text-xs mt-2">Cole o link do YouTube (ex: https://youtu.be/Kicotda5iCg)</p>
              </div>
              <button onClick={confirmSaveVideo} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold uppercase py-4 rounded-sm transition-all mt-4 flex items-center justify-center gap-2"><Save className="w-5 h-5" />{editingVideo ? 'Guardar Alterações' : 'Adicionar Vídeo'}</button>
            </div>
          </motion.div>
        </div>
      )}

      <footer className="px-6 py-4 border-t border-zinc-800 text-center text-zinc-600 text-sm">© 2026 Ribeiro & Moreira - Metal Services</footer>
    </div>
  );
};

export default VideoGalleryPage;
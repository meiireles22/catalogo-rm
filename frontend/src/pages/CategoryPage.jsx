import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, LogOut, ChevronRight, Plus, X, Trash2, Camera, Pencil, User, AlertTriangle, Image, Palette, Ruler, Zap, Save, Check, AlertCircle, Maximize2 } from 'lucide-react';
import { getCategory, getProducts } from '@/data/products';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Play } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const CATALOGO_CORES = {
  'Pré Lacado Aço 0.5': [
    { nome: 'RAL 8023', cor: '#A65E2E' },
    { nome: 'RAL 3009', cor: '#6D342D' },
    { nome: 'RAL 8004', cor: '#8E402A' },
    { nome: 'RAL 8017', cor: '#442F29' },
    { nome: 'RAL 1015', cor: '#E6D2B5' },
    { nome: 'RAL 9010', cor: '#F7F5E6' },
    { nome: 'RAL 7038', cor: '#B4B8B0' },
    { nome: 'RAL 9006', cor: '#A5A5A5' },
    { nome: 'RAL 9007', cor: '#8F8F8F' },
    { nome: 'RAL 7012', cor: '#575D5E' },
    { nome: 'RAL 7016', cor: '#383E42' },
    { nome: 'RAL 7022', cor: '#4B4D46' },
    { nome: 'RAL 9005', cor: '#0A0A0D' },
    { nome: 'RAL 6005', cor: '#0F4336' },
  ],
  'Pré Lacado Alumínio 0.7': [
    { nome: 'RAL 3005', cor: '#5E2028' },
    { nome: 'RAL 9010', cor: '#F7F5E6' },
    { nome: 'RAL 9010 Texturado', cor: '#F7F5E6' },
    { nome: 'Champanhe', cor: '#F7E7CE' },
    { nome: 'RAL 7011', cor: '#555D5F' },
    { nome: 'RAL 7016', cor: '#383E42' },
    { nome: 'RAL 9006', cor: '#A5A5A5' },
    { nome: 'RAL 7022 Texturado', cor: '#4B4D46' },
    { nome: 'RAL 7035 Texturado', cor: '#CBD0CC' },
    { nome: 'Gris 900 Sablé', cor: '#8B8B8B' },
    { nome: 'Noir 100 Sablé', cor: '#2C2C2C' },
    { nome: 'Noir 200 Sablé', cor: '#1A1A1A' },
    { nome: 'Brun 650 Sablé', cor: '#6B4423' },
    { nome: 'RAL 9005', cor: '#0A0A0D' },
    { nome: 'RAL 9005 Texturado', cor: '#0A0A0D' },
  ],
};

const PARAMETROS_LASER_INICIAL = [
  { id: 1, material: 'Aço Carbono', potencia: '12 kW', espessura: '30 mm' },
  { id: 2, material: 'Aço Inoxidável', potencia: '12 kW', espessura: '25 mm (até 30 mm)' },
  { id: 3, material: 'Alumínio', potencia: '12 kW', espessura: '30 mm (até 40 mm)' },
  { id: 4, material: 'Latão', potencia: '12 kW', espessura: '20 mm' },
  { id: 5, material: 'Cobre', potencia: '12 kW', espessura: '15 mm' },
];

const PARAMETROS_QUINAGEM_INICIAL = [
  { id: 1, material: 'Aço Carbono', espessuraRecomendada: '10 mm', espessuraMaxima: '11-12 mm', comprimentoMaximo: 'até 4000 mm' },
  { id: 2, material: 'Aço Inoxidável', espessuraRecomendada: '8 mm', espessuraMaxima: '9-10 mm', comprimentoMaximo: 'até 4000 mm' },
  { id: 3, material: 'Alumínio', espessuraRecomendada: '12 mm', espessuraMaxima: '14-16 mm', comprimentoMaximo: 'até 4000 mm' },
  { id: 4, material: 'Latão', espessuraRecomendada: '10 mm', espessuraMaxima: '12 mm', comprimentoMaximo: 'até 4000 mm' },
  { id: 5, material: 'Cobre', espessuraRecomendada: '8 mm', espessuraMaxima: '10 mm', comprimentoMaximo: 'até 4000 mm' },
];

const CategoryPage = ({ onLogout, isAdmin, username }) => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const cameraInputRef = useRef(null);
  
  const category = getCategory(categoryId);
  const staticProducts = getProducts(categoryId);
  
  const [dbProducts, setDbProducts] = useState([]);
  const [staticEdits, setStaticEdits] = useState({});
  const [deletedStaticIds, setDeletedStaticIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditingStatic, setIsEditingStatic] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showColorsModal, setShowColorsModal] = useState(false);
  
  const [showLaserModal, setShowLaserModal] = useState(false);
  const [parametrosLaser, setParametrosLaser] = useState([]);
  const [editingLaser, setEditingLaser] = useState(false);
  
  const [showQuinagemModal, setShowQuinagemModal] = useState(false);
  const [parametrosQuinagem, setParametrosQuinagem] = useState([]);
  const [editingQuinagem, setEditingQuinagem] = useState(false);
  
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmPopupData, setConfirmPopupData] = useState({
    type: 'success',
    title: '',
    message: '',
    onConfirm: null,
    showCancel: false
  });
  
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    image: '',
    cotacoes_image: '',
    specs: { material: '', espessura: '', comprimento: '' }
  });
  const [cotacoesPreview, setCotacoesPreview] = useState('');

  const showConfirm = (title, message, onConfirm, type = 'confirm') => {
    setConfirmPopupData({ type, title, message, onConfirm, showCancel: true });
    setShowConfirmPopup(true);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessPopup(true);
    setTimeout(() => setShowSuccessPopup(false), 2000);
  };

  const showError = (message) => {
    setConfirmPopupData({
      type: 'error',
      title: 'Erro',
      message,
      onConfirm: () => setShowConfirmPopup(false),
      showCancel: false
    });
    setShowConfirmPopup(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productsRes = await axios.get(`${API}/products/${categoryId}`);
        setDbProducts(productsRes.data);
        const editsRes = await axios.get(`${API}/static-products/edits`);
        const editsMap = {};
        editsRes.data.forEach(edit => { editsMap[edit.id] = edit; });
        setStaticEdits(editsMap);
      } catch (error) {
        console.log('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const deleted = JSON.parse(localStorage.getItem('deletedProducts') || '[]');
    setDeletedStaticIds(deleted);
    const savedLaser = localStorage.getItem('parametrosLaser');
    setParametrosLaser(savedLaser ? JSON.parse(savedLaser) : PARAMETROS_LASER_INICIAL);
    const savedQuinagem = localStorage.getItem('parametrosQuinagem');
    setParametrosQuinagem(savedQuinagem ? JSON.parse(savedQuinagem) : PARAMETROS_QUINAGEM_INICIAL);
  }, [categoryId]);

  const getStaticProductWithEdits = (product) => staticEdits[product.id] ? { ...product, ...staticEdits[product.id] } : product;
  const visibleStaticProducts = staticProducts.filter(p => !deletedStaticIds.includes(p.id)).map(getStaticProductWithEdits);
  const allProducts = [...visibleStaticProducts, ...dbProducts];

  const handleImageSelect = (e, type = 'product') => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { showError('Imagem muito grande! Máximo 5MB'); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        if (type === 'cotacoes') { setCotacoesPreview(base64); setNewProduct({...newProduct, cotacoes_image: base64}); }
        else { setImagePreview(base64); setNewProduct({...newProduct, image: base64}); }
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmSaveProduct = () => {
    if (!newProduct.name || !newProduct.description) { showError('Preenche o nome e a descrição'); return; }
    showConfirm(
      editingProduct ? 'Guardar Alterações' : 'Adicionar Produto',
      editingProduct ? `Tem a certeza que deseja guardar as alterações do produto "${newProduct.name}"?` : `Tem a certeza que deseja adicionar o produto "${newProduct.name}"?`,
      handleAddProduct, 'confirm'
    );
  };

  const handleAddProduct = async () => {
    setShowConfirmPopup(false);
    const filteredSpecs = {};
    Object.entries(newProduct.specs).forEach(([key, value]) => { if (value && value.trim() !== '') filteredSpecs[key] = value; });
    try {
      if (isEditingStatic && editingProduct) {
        const response = await axios.put(`${API}/static-products/${editingProduct.id}`, {
          name: newProduct.name, description: newProduct.description, image: newProduct.image || editingProduct.image,
          category_id: categoryId, specs: filteredSpecs, cotacoes_image: newProduct.cotacoes_image || editingProduct.cotacoes_image || ''
        });
        setStaticEdits({ ...staticEdits, [editingProduct.id]: response.data });
        showSuccess('Produto actualizado com sucesso!');
      } else if (editingProduct) {
        const response = await axios.put(`${API}/products/${editingProduct.id}`, {
          name: newProduct.name, description: newProduct.description, image: newProduct.image,
          category_id: categoryId, specs: filteredSpecs, cotacoes_image: newProduct.cotacoes_image || ''
        });
        setDbProducts(dbProducts.map(p => p.id === editingProduct.id ? response.data : p));
        showSuccess('Produto actualizado com sucesso!');
      } else {
        const response = await axios.post(`${API}/products`, {
          name: newProduct.name, description: newProduct.description, image: newProduct.image,
          category_id: categoryId, specs: filteredSpecs, cotacoes_image: newProduct.cotacoes_image || ''
        });
        setDbProducts([...dbProducts, response.data]);
        showSuccess('Produto adicionado com sucesso!');
      }
      closeModal();
    } catch (error) { showError('Erro ao guardar produto. Tente novamente.'); }
  };

  const handleEditProduct = (product, isStatic = false) => {
    setEditingProduct(product);
    setIsEditingStatic(isStatic);
    setNewProduct({
      name: product.name, description: product.description, image: product.image, cotacoes_image: product.cotacoes_image || '',
      specs: { material: product.specs?.material || '', espessura: product.specs?.espessura || '', comprimento: product.specs?.comprimento || '' }
    });
    setImagePreview(product.image);
    setCotacoesPreview(product.cotacoes_image || '');
    setShowModal(true);
  };

  const openDeleteConfirm = (product, isFromDb) => { setProductToDelete({ ...product, isFromDb }); setShowDeleteConfirm(true); };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    const { id, isFromDb } = productToDelete;
    if (isFromDb) {
      try { await axios.delete(`${API}/products/${id}`); setDbProducts(dbProducts.filter(p => p.id !== id)); showSuccess('Produto eliminado com sucesso!'); }
      catch (error) { showError('Erro ao eliminar produto'); }
    } else {
      const newDeletedIds = [...deletedStaticIds, id];
      setDeletedStaticIds(newDeletedIds);
      localStorage.setItem('deletedProducts', JSON.stringify(newDeletedIds));
      showSuccess('Produto eliminado com sucesso!');
    }
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  const cancelDelete = () => { setShowDeleteConfirm(false); setProductToDelete(null); };

  const closeModal = () => {
    setShowModal(false); setEditingProduct(null); setIsEditingStatic(false);
    setNewProduct({ name: '', description: '', image: '', cotacoes_image: '', specs: { material: '', espessura: '', comprimento: '' } });
    setImagePreview(''); setCotacoesPreview('');
  };

  const openAddModal = () => {
    setEditingProduct(null); setIsEditingStatic(false);
    setNewProduct({ name: '', description: '', image: '', cotacoes_image: '', specs: { material: '', espessura: '', comprimento: '' } });
    setImagePreview(''); setCotacoesPreview(''); setShowModal(true);
  };

  const handleLaserChange = (id, field, value) => { setParametrosLaser(parametrosLaser.map(p => p.id === id ? { ...p, [field]: value } : p)); };
  const confirmSaveLaserParams = () => { showConfirm('Guardar Parâmetros', 'Tem a certeza que deseja guardar as alterações nos parâmetros do laser?', saveLaserParams, 'confirm'); };
  const saveLaserParams = () => { setShowConfirmPopup(false); localStorage.setItem('parametrosLaser', JSON.stringify(parametrosLaser)); setEditingLaser(false); showSuccess('Parâmetros guardados com sucesso!'); };
  const addLaserRow = () => { const newId = Math.max(...parametrosLaser.map(p => p.id)) + 1; setParametrosLaser([...parametrosLaser, { id: newId, material: '', potencia: '', espessura: '' }]); };
  const confirmRemoveLaserRow = (id, materialName) => { showConfirm('Remover Material', `Tem a certeza que deseja remover "${materialName || 'este material'}" da tabela?`, () => removeLaserRow(id), 'warning'); };
  const removeLaserRow = (id) => { setShowConfirmPopup(false); if (parametrosLaser.length > 1) { setParametrosLaser(parametrosLaser.filter(p => p.id !== id)); showSuccess('Material removido!'); } };

  const handleQuinagemChange = (id, field, value) => { setParametrosQuinagem(parametrosQuinagem.map(p => p.id === id ? { ...p, [field]: value } : p)); };
  const confirmSaveQuinagemParams = () => { showConfirm('Guardar Parâmetros', 'Tem a certeza que deseja guardar as alterações nos parâmetros de quinagem?', saveQuinagemParams, 'confirm'); };
  const saveQuinagemParams = () => { setShowConfirmPopup(false); localStorage.setItem('parametrosQuinagem', JSON.stringify(parametrosQuinagem)); setEditingQuinagem(false); showSuccess('Parâmetros de quinagem guardados com sucesso!'); };
  const addQuinagemRow = () => { const newId = Math.max(...parametrosQuinagem.map(p => p.id)) + 1; setParametrosQuinagem([...parametrosQuinagem, { id: newId, material: '', espessuraRecomendada: '', espessuraMaxima: '', comprimentoMaximo: '' }]); };
  const confirmRemoveQuinagemRow = (id, materialName) => { showConfirm('Remover Material', `Tem a certeza que deseja remover "${materialName || 'este material'}" da tabela?`, () => removeQuinagemRow(id), 'warning'); };
  const removeQuinagemRow = (id) => { setShowConfirmPopup(false); if (parametrosQuinagem.length > 1) { setParametrosQuinagem(parametrosQuinagem.filter(p => p.id !== id)); showSuccess('Material removido!'); } };

  if (!category) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><p className="text-zinc-400">Categoria não encontrada</p></div>;
  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="text-center"><div className="w-10 h-10 border-3 border-[#00c853] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-zinc-400">A carregar produtos...</p></div></div>;

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/catalogo')} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <img src="https://customer-assets.emergentagent.com/job_mostruario-metal/artifacts/dyyus9dq_LOGOTIPO_VERDE_ASSINATURA%20%28002%29.png" alt="Logo" className="h-8 object-contain cursor-pointer" onClick={() => navigate('/catalogo')} />
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-sm ${isAdmin ? 'bg-[#00c853]/20 text-[#00c853]' : 'bg-blue-500/20 text-blue-400'}`}><User className="w-4 h-4" /><span className="text-sm font-medium">{username}</span></div>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"><LogOut className="w-5 h-5" /><span className="hidden sm:inline uppercase text-sm tracking-wide">Sair</span></button>
        </div>
      </header>

      <div className="relative h-48 md:h-64 bg-cover bg-center" style={{ backgroundImage: `url('${category.image}')` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-white font-['Oswald'] uppercase tracking-wider">{category.name}</h1>
            <p className="text-zinc-300 mt-2 max-w-2xl">{category.description}</p>
          </div>
          <div className="flex gap-3">
            {categoryId === 'remates' && <button onClick={() => setShowColorsModal(true)} className="bg-zinc-700 hover:bg-zinc-600 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110" title="Catálogo de Cores"><Palette className="w-6 h-6" /></button>}
            {categoryId === 'corte-laser' && <button onClick={() => setShowLaserModal(true)} className="bg-orange-600 hover:bg-orange-500 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110" title="Parâmetros do Laser"><Zap className="w-6 h-6" /></button>}
            {categoryId === 'quinagem' && <button onClick={() => setShowQuinagemModal(true)} className="bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110" title="Parâmetros de Quinagem"><Maximize2 className="w-6 h-6" /></button>}
            {isAdmin && <button onClick={openAddModal} className="bg-[#00c853] hover:bg-[#00e676] text-black p-4 rounded-full shadow-lg transition-all hover:scale-110" title="Adicionar Produto"><Plus className="w-6 h-6" /></button>}
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 md:p-10">
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
          {allProducts.map((product, index) => {
            const isFromDb = dbProducts.some(p => p.id === product.id);
            const isStatic = !isFromDb;
            return (
              <motion.div key={`${product.id}-${index}`} className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden relative" variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                {isAdmin && (
                  <div className="absolute top-3 right-3 z-10 flex gap-2">
                    <motion.button onClick={(e) => { e.stopPropagation(); handleEditProduct(product, isStatic); }} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Pencil className="w-5 h-5" /></motion.button>
                    <motion.button onClick={(e) => { e.stopPropagation(); openDeleteConfirm(product, isFromDb); }} className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Trash2 className="w-5 h-5" /></motion.button>
                  </div>
                )}
                <motion.div onClick={() => navigate(`/catalogo/${categoryId}/${product.id}`)} className="cursor-pointer" whileTap={{ scale: 0.98 }}>
                  <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                    <img src={product.image || category.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = category.image; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white font-['Oswald'] uppercase tracking-wide mb-2">{product.name}</h3>
                    <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#00c853] text-sm font-medium uppercase tracking-wide">Ver Detalhes</span>
                      <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ChevronRight className="w-5 h-5 text-[#00c853]" /></motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
        {allProducts.length === 0 && <div className="text-center py-20"><p className="text-zinc-400">Nenhum produto disponível nesta categoria.</p>{isAdmin && <button onClick={openAddModal} className="mt-4 bg-[#00c853] hover:bg-[#00e676] text-black font-bold py-3 px-6 rounded-sm">Adicionar Primeiro Produto</button>}</div>}
      </main>

      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div className="fixed top-4 right-4 z-[100] bg-[#00c853] text-black px-6 py-4 rounded-sm shadow-2xl flex items-center gap-3" initial={{ opacity: 0, x: 100, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 100, scale: 0.8 }} transition={{ type: "spring", duration: 0.5 }}>
            <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center"><Check className="w-5 h-5" /></div>
            <span className="font-bold">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmPopup && (
          <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[90] p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-zinc-900 border border-zinc-700 rounded-sm w-full max-w-md p-6" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", duration: 0.3 }}>
              <div className="flex justify-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${confirmPopupData.type === 'error' ? 'bg-red-600/20' : confirmPopupData.type === 'warning' ? 'bg-yellow-600/20' : confirmPopupData.type === 'confirm' ? 'bg-blue-600/20' : 'bg-[#00c853]/20'}`}>
                  {confirmPopupData.type === 'error' ? <AlertCircle className="w-8 h-8 text-red-500" /> : confirmPopupData.type === 'warning' ? <AlertTriangle className="w-8 h-8 text-yellow-500" /> : confirmPopupData.type === 'confirm' ? <Save className="w-8 h-8 text-blue-500" /> : <Check className="w-8 h-8 text-[#00c853]" />}
                </div>
              </div>
              <h2 className="text-xl font-bold text-white text-center font-['Oswald'] uppercase tracking-wide mb-3">{confirmPopupData.title}</h2>
              <p className="text-zinc-300 text-center mb-8">{confirmPopupData.message}</p>
              <div className={`flex gap-4 ${confirmPopupData.showCancel ? '' : 'justify-center'}`}>
                {confirmPopupData.showCancel && <button onClick={() => setShowConfirmPopup(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium uppercase tracking-wide py-4 rounded-sm transition-all border border-zinc-700">Cancelar</button>}
                <button onClick={confirmPopupData.onConfirm} className={`flex-1 font-bold uppercase tracking-wide py-4 rounded-sm transition-all flex items-center justify-center gap-2 ${confirmPopupData.type === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' : confirmPopupData.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 text-black' : 'bg-[#00c853] hover:bg-[#00e676] text-black'}`}>
                  {confirmPopupData.type === 'error' ? <><AlertCircle className="w-5 h-5" />OK</> : <><Check className="w-5 h-5" />Confirmar</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showColorsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-sm w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white font-['Oswald'] uppercase tracking-wide flex items-center gap-3"><Palette className="w-7 h-7 text-[#00c853]" />Catálogo de Cores</h2>
              <button onClick={() => setShowColorsModal(false)} className="text-zinc-400 hover:text-white p-2 hover:bg-zinc-800 rounded-sm transition-colors"><X className="w-6 h-6" /></button>
            </div>
            {Object.entries(CATALOGO_CORES).map(([seccao, cores]) => (
              <div key={seccao} className="mb-8">
                <h3 className="text-lg font-bold text-[#00c853] font-['Oswald'] uppercase tracking-wide mb-4 pb-2 border-b border-zinc-700">{seccao}</h3>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-4">
                  {cores.map((item, index) => (<div key={index} className="flex flex-col items-center group"><div className="w-16 h-16 rounded-sm border-2 border-zinc-700 group-hover:border-[#00c853] transition-colors shadow-lg" style={{ backgroundColor: item.cor }} /><span className="text-zinc-400 text-xs mt-2 text-center group-hover:text-white transition-colors">{item.nome}</span></div>))}
                </div>
              </div>
            ))}
            <div className="mt-4 pt-6 border-t border-zinc-700"><p className="text-zinc-500 text-sm text-center">Cores disponíveis para acabamentos. Contacte-nos para cores personalizadas.</p></div>
          </div>
        </div>
      )}

      {showLaserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-sm w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white font-['Oswald'] uppercase tracking-wide flex items-center gap-3"><Zap className="w-7 h-7 text-orange-500" />Parâmetros do Laser</h2>
              <div className="flex items-center gap-3">
                {isAdmin && !editingLaser && <button onClick={() => setEditingLaser(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-sm transition-colors"><Pencil className="w-4 h-4" />Editar</button>}
                {isAdmin && editingLaser && <button onClick={confirmSaveLaserParams} className="flex items-center gap-2 bg-[#00c853] hover:bg-[#00e676] text-black px-4 py-2 rounded-sm transition-colors font-bold"><Save className="w-4 h-4" />Guardar</button>}
                <button onClick={() => { setShowLaserModal(false); setEditingLaser(false); }} className="text-zinc-400 hover:text-white p-2 hover:bg-zinc-800 rounded-sm transition-colors"><X className="w-6 h-6" /></button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-zinc-700"><th className="text-left text-zinc-400 text-sm uppercase tracking-wide py-4 px-4">Material</th><th className="text-left text-zinc-400 text-sm uppercase tracking-wide py-4 px-4">Potência</th><th className="text-left text-zinc-400 text-sm uppercase tracking-wide py-4 px-4">Espessura Máxima de Corte</th>{isAdmin && editingLaser && <th className="w-16"></th>}</tr></thead>
                <tbody>
                  {parametrosLaser.map((param) => (
                    <tr key={param.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                      <td className="py-4 px-4">{editingLaser && isAdmin ? <input type="text" value={param.material} onChange={(e) => handleLaserChange(param.id, 'material', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-white focus:border-orange-500 focus:outline-none" /> : <span className="text-white font-medium">{param.material}</span>}</td>
                      <td className="py-4 px-4">{editingLaser && isAdmin ? <input type="text" value={param.potencia} onChange={(e) => handleLaserChange(param.id, 'potencia', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-white focus:border-orange-500 focus:outline-none" /> : <span className="text-zinc-300">{param.potencia}</span>}</td>
                      <td className="py-4 px-4">{editingLaser && isAdmin ? <input type="text" value={param.espessura} onChange={(e) => handleLaserChange(param.id, 'espessura', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-white focus:border-orange-500 focus:outline-none" /> : <span className="text-zinc-300">{param.espessura}</span>}</td>
                      {isAdmin && editingLaser && <td className="py-4 px-2"><button onClick={() => confirmRemoveLaserRow(param.id, param.material)} className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-sm transition-colors"><Trash2 className="w-4 h-4" /></button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {isAdmin && editingLaser && <button onClick={addLaserRow} className="mt-4 flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors"><Plus className="w-5 h-5" />Adicionar Material</button>}
            <div className="mt-6 pt-6 border-t border-zinc-700"><p className="text-zinc-500 text-sm text-center">Parâmetros de corte laser para diferentes materiais. {isAdmin ? 'Clique em Editar para modificar.' : ''}</p></div>
          </div>
        </div>
      )}

      {showQuinagemModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-sm w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white font-['Oswald'] uppercase tracking-wide flex items-center gap-3"><Maximize2 className="w-7 h-7 text-purple-500" />Parâmetros de Quinagem</h2>
              <div className="flex items-center gap-3">
                {isAdmin && !editingQuinagem && <button onClick={() => setEditingQuinagem(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-sm transition-colors"><Pencil className="w-4 h-4" />Editar</button>}
                {isAdmin && editingQuinagem && <button onClick={confirmSaveQuinagemParams} className="flex items-center gap-2 bg-[#00c853] hover:bg-[#00e676] text-black px-4 py-2 rounded-sm transition-colors font-bold"><Save className="w-4 h-4" />Guardar</button>}
                <button onClick={() => { setShowQuinagemModal(false); setEditingQuinagem(false); }} className="text-zinc-400 hover:text-white p-2 hover:bg-zinc-800 rounded-sm transition-colors"><X className="w-6 h-6" /></button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-zinc-700"><th className="text-left text-zinc-400 text-sm uppercase tracking-wide py-4 px-4">Material</th><th className="text-left text-zinc-400 text-sm uppercase tracking-wide py-4 px-4">Espessura Recomendada</th><th className="text-left text-zinc-400 text-sm uppercase tracking-wide py-4 px-4">Espessura Máxima Aprox.</th><th className="text-left text-zinc-400 text-sm uppercase tracking-wide py-4 px-4">Comprimento Máximo</th>{isAdmin && editingQuinagem && <th className="w-16"></th>}</tr></thead>
                <tbody>
                  {parametrosQuinagem.map((param) => (
                    <tr key={param.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                      <td className="py-4 px-4">{editingQuinagem && isAdmin ? <input type="text" value={param.material} onChange={(e) => handleQuinagemChange(param.id, 'material', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-white focus:border-purple-500 focus:outline-none" /> : <span className="text-white font-medium">{param.material}</span>}</td>
                      <td className="py-4 px-4">{editingQuinagem && isAdmin ? <input type="text" value={param.espessuraRecomendada} onChange={(e) => handleQuinagemChange(param.id, 'espessuraRecomendada', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-white focus:border-purple-500 focus:outline-none" /> : <span className="text-zinc-300">{param.espessuraRecomendada}</span>}</td>
                      <td className="py-4 px-4">{editingQuinagem && isAdmin ? <input type="text" value={param.espessuraMaxima} onChange={(e) => handleQuinagemChange(param.id, 'espessuraMaxima', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-white focus:border-purple-500 focus:outline-none" /> : <span className="text-zinc-300">{param.espessuraMaxima}</span>}</td>
                      <td className="py-4 px-4">{editingQuinagem && isAdmin ? <input type="text" value={param.comprimentoMaximo} onChange={(e) => handleQuinagemChange(param.id, 'comprimentoMaximo', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-white focus:border-purple-500 focus:outline-none" /> : <span className="text-zinc-300">{param.comprimentoMaximo}</span>}</td>
                      {isAdmin && editingQuinagem && <td className="py-4 px-2"><button onClick={() => confirmRemoveQuinagemRow(param.id, param.material)} className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-sm transition-colors"><Trash2 className="w-4 h-4" /></button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {isAdmin && editingQuinagem && <button onClick={addQuinagemRow} className="mt-4 flex items-center gap-2 text-purple-500 hover:text-purple-400 transition-colors"><Plus className="w-5 h-5" />Adicionar Material</button>}
            <div className="mt-6 pt-6 border-t border-zinc-700"><p className="text-zinc-500 text-sm text-center">Parâmetros de quinagem para diferentes materiais. {isAdmin ? 'Clique em Editar para modificar.' : ''}</p></div>
          </div>
        </div>
      )}

      {showDeleteConfirm && productToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div className="bg-zinc-900 border border-zinc-700 rounded-sm w-full max-w-md p-6" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.3 }}>
            <div className="flex justify-center mb-6"><div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center"><AlertTriangle className="w-8 h-8 text-red-500" /></div></div>
            <h2 className="text-xl font-bold text-white text-center font-['Oswald'] uppercase tracking-wide mb-3">Confirmar Eliminação</h2>
            <p className="text-zinc-300 text-center mb-2">Tem a certeza de que pretende eliminar o produto</p>
            <p className="text-[#00c853] text-center font-bold text-lg mb-6">"{productToDelete.name}"</p>
            <p className="text-zinc-500 text-center text-sm mb-8">Esta ação não poderá ser revertida.</p>
            <div className="flex gap-4">
              <button onClick={cancelDelete} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium uppercase tracking-wide py-4 rounded-sm transition-all border border-zinc-700">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wide py-4 rounded-sm transition-all flex items-center justify-center gap-2"><Trash2 className="w-5 h-5" />Eliminar</button>
            </div>
          </motion.div>
        </div>
      )}

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-sm w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white font-['Oswald'] uppercase">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={closeModal} className="text-zinc-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-sm mb-2 uppercase">Imagem do Produto</label>
                <div className="aspect-video bg-zinc-800 rounded-sm overflow-hidden flex items-center justify-center border-2 border-dashed border-zinc-700">
                  {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <div className="text-center text-zinc-500"><Camera className="w-12 h-12 mx-auto mb-2" /><p>Nenhuma imagem selecionada</p></div>}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => handleImageSelect(e, 'product')} className="hidden" />
                  <input id="galleryInput" type="file" accept="image/*" onChange={(e) => handleImageSelect(e, 'product')} className="hidden" />
                  <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-4 rounded-sm border border-zinc-700 transition-colors"><Camera className="w-5 h-5" /><span>Câmara</span></button>
                  <button type="button" onClick={() => document.getElementById('galleryInput')?.click()} className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-4 rounded-sm border border-zinc-700 transition-colors"><Image className="w-5 h-5" /><span>Galeria</span></button>
                </div>
              </div>
              {(categoryId === 'remates' || categoryId === 'carrocarias') && (
                <div>
                  <label className="block text-zinc-400 text-sm mb-2 uppercase">Imagem de Cotações / Dimensões</label>
                  <div className="aspect-video bg-zinc-800 rounded-sm overflow-hidden flex items-center justify-center border-2 border-dashed border-[#00c853]/30">
                    {cotacoesPreview ? <img src={cotacoesPreview} alt="Cotações Preview" className="w-full h-full object-contain bg-white" /> : <div className="text-center text-zinc-500"><Ruler className="w-12 h-12 mx-auto mb-2 text-[#00c853]/50" /><p>Imagem de cotações (opcional)</p></div>}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <input id="cotacoesCameraInput" type="file" accept="image/*" capture="environment" onChange={(e) => handleImageSelect(e, 'cotacoes')} className="hidden" />
                    <input id="cotacoesGalleryInput" type="file" accept="image/*" onChange={(e) => handleImageSelect(e, 'cotacoes')} className="hidden" />
                    <button type="button" onClick={() => document.getElementById('cotacoesCameraInput')?.click()} className="flex items-center justify-center gap-2 bg-[#00c853]/10 hover:bg-[#00c853]/20 text-[#00c853] py-3 px-4 rounded-sm border border-[#00c853]/30 transition-colors"><Camera className="w-5 h-5" /><span>Câmara</span></button>
                    <button type="button" onClick={() => document.getElementById('cotacoesGalleryInput')?.click()} className="flex items-center justify-center gap-2 bg-[#00c853]/10 hover:bg-[#00c853]/20 text-[#00c853] py-3 px-4 rounded-sm border border-[#00c853]/30 transition-colors"><Image className="w-5 h-5" /><span>Galeria</span></button>
                  </div>
                </div>
              )}
              <div><label className="block text-zinc-400 text-sm mb-2 uppercase">Nome *</label><input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-4 py-3 text-white focus:border-[#00c853] focus:outline-none" placeholder="Nome do produto" /></div>
              <div><label className="block text-zinc-400 text-sm mb-2 uppercase">Descrição *</label><textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-4 py-3 text-white focus:border-[#00c853] focus:outline-none h-40 resize-none" placeholder="Descrição do produto" /></div>
              <div className="border-t border-zinc-700 pt-4 mt-4">
                <h3 className="text-white font-bold mb-4 uppercase text-sm">Especificações Técnicas (Opcional)</h3>
                <div className="space-y-3">
                  <div><label className="block text-zinc-500 text-xs mb-1 uppercase">Material</label><input type="text" value={newProduct.specs.material} onChange={(e) => setNewProduct({...newProduct, specs: {...newProduct.specs, material: e.target.value}})} className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-white text-sm focus:border-[#00c853] focus:outline-none" placeholder="Escreva o material" /></div>
                  <div><label className="block text-zinc-500 text-xs mb-1 uppercase">Espessura</label><input type="text" value={newProduct.specs.espessura} onChange={(e) => setNewProduct({...newProduct, specs: {...newProduct.specs, espessura: e.target.value}})} className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-white text-sm focus:border-[#00c853] focus:outline-none" placeholder="Escreva a espessura" /></div>
                  <div><label className="block text-zinc-500 text-xs mb-1 uppercase">Comprimento</label><input type="text" value={newProduct.specs.comprimento} onChange={(e) => setNewProduct({...newProduct, specs: {...newProduct.specs, comprimento: e.target.value}})} className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-white text-sm focus:border-[#00c853] focus:outline-none" placeholder="Ex: Até 6400mm" /></div>
                </div>
              </div>
              <button onClick={confirmSaveProduct} className="w-full bg-[#00c853] hover:bg-[#00e676] text-black font-bold uppercase py-4 rounded-sm transition-all mt-4">{editingProduct ? 'Guardar Alterações' : 'Adicionar Produto'}</button>
            </div>
          </div>
        </div>
      )}
      <footer className="px-6 py-4 border-t border-zinc-800 text-center text-zinc-600 text-sm">© 2026 Ribeiro & Moreira - Metal Services</footer>
    </div>
  );
};

export default CategoryPage;
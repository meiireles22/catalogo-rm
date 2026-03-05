import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, LogOut, Package, Ruler, Settings } from 'lucide-react';
import { getCategory, getProduct } from '@/data/products';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

// Animações de página
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

const ProductPage = ({ onLogout }) => {
  const { categoryId, productId } = useParams();
  const navigate = useNavigate();
  
  const category = getCategory(categoryId);
  const staticProduct = getProduct(categoryId, productId);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('product');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (staticProduct) {
          const editsRes = await axios.get(`${API}/static-products/edits`);
          const edit = editsRes.data.find(e => e.id === productId);
          
          if (edit) {
            setProduct({ ...staticProduct, ...edit });
          } else {
            setProduct(staticProduct);
          }
        } else {
          const response = await axios.get(`${API}/products/${categoryId}`);
          const found = response.data.find(p => p.id === productId);
          setProduct(found || null);
        }
      } catch (error) {
        console.log('Erro ao carregar produto:', error);
        if (staticProduct) {
          setProduct(staticProduct);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [categoryId, productId, staticProduct]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-10 h-10 border-3 border-[#00c853] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">A carregar...</p>
        </motion.div>
      </div>
    );
  }

  if (!product || !category) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <p className="text-zinc-400">Produto não encontrado</p>
      </div>
    );
  }

  const hasSpecs = product.specs && (
    product.specs.material || 
    product.specs.espessura || 
    product.specs.comprimento
  );

  const hasCotacoesImage = product.cotacoes_image && product.cotacoes_image.length > 0;

  return (
    <motion.div 
      className="min-h-screen bg-[#09090b] flex flex-col"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.header 
        className="flex items-center justify-between px-6 py-4 border-b border-zinc-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate(`/catalogo/${categoryId}`)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <img 
            src="https://customer-assets.emergentagent.com/job_mostruario-metal/artifacts/dyyus9dq_LOGOTIPO_VERDE_ASSINATURA%20%28002%29.png"
            alt="Logo"
            className="h-8 object-contain cursor-pointer"
            onClick={() => navigate('/catalogo')}
          />
        </div>
        <motion.button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline uppercase text-sm tracking-wide">Sair</span>
        </motion.button>
      </motion.header>

      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 text-sm text-zinc-500 mb-6"
          >
            <span 
              className="hover:text-[#00c853] cursor-pointer transition-colors"
              onClick={() => navigate('/catalogo')}
            >
              Catálogo
            </span>
            <span>/</span>
            <span 
              className="hover:text-[#00c853] cursor-pointer transition-colors"
              onClick={() => navigate(`/catalogo/${categoryId}`)}
            >
              {category.name}
            </span>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {hasCotacoesImage ? (
                <>
                  <motion.div 
                    className="aspect-square rounded-sm overflow-hidden border border-zinc-800 bg-zinc-900 mb-4"
                    layoutId={`product-image-${productId}`}
                  >
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeImage}
                        src={activeImage === 'product' ? (product.image || category.image) : product.cotacoes_image}
                        alt={product.name}
                        className={`w-full h-full ${activeImage === 'cotacoes' ? 'object-contain bg-white p-4' : 'object-cover'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onError={(e) => { e.target.src = category.image; }}
                      />
                    </AnimatePresence>
                  </motion.div>
                  
                  <motion.div 
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.button
                      onClick={() => setActiveImage('product')}
                      className={`w-24 h-24 rounded-sm overflow-hidden border-2 transition-all ${activeImage === 'product' ? 'border-[#00c853]' : 'border-zinc-700 hover:border-zinc-500'}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src={product.image || category.image}
                        alt="Produto"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = category.image; }}
                      />
                    </motion.button>
                    <motion.button
                      onClick={() => setActiveImage('cotacoes')}
                      className={`w-24 h-24 rounded-sm overflow-hidden border-2 transition-all ${activeImage === 'cotacoes' ? 'border-[#00c853]' : 'border-zinc-700 hover:border-zinc-500'}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src={product.cotacoes_image}
                        alt="Cotações"
                        className="w-full h-full object-contain bg-white p-1"
                      />
                    </motion.button>
                  </motion.div>
                </>
              ) : (
                <motion.div 
                  className="aspect-video lg:aspect-square rounded-sm overflow-hidden border border-zinc-800 bg-zinc-900"
                  layoutId={`product-image-${productId}`}
                >
                  <img
                    src={product.image || category.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = category.image; }}
                  />
                </motion.div>
              )}
              
              <motion.div 
                className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-[#00c853]/10 border border-[#00c853]/30 rounded-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-[#00c853] text-sm font-medium uppercase tracking-wide">
                  {category.name}
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6"
            >
              <div>
                <motion.h1 
                  className="text-3xl md:text-4xl font-bold text-white font-['Oswald'] uppercase tracking-wider mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {product.name}
                </motion.h1>
                <motion.p 
                  className="text-zinc-300 text-lg leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {product.description}
                </motion.p>
              </div>

              {hasSpecs && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h2 className="text-xl font-bold text-white font-['Oswald'] uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#00c853]" />
                    Especificações Técnicas
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.specs.material && (
                      <motion.div 
                        className="bg-zinc-900 border border-zinc-800 rounded-sm p-4 hover:border-zinc-700 transition-colors"
                        whileHover={{ scale: 1.02, borderColor: '#00c853' }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-[#00c853]" />
                          <span className="text-zinc-500 text-xs uppercase tracking-wide">Material</span>
                        </div>
                        <p className="text-white font-medium">{product.specs.material}</p>
                      </motion.div>
                    )}
                    
                    {product.specs.espessura && (
                      <motion.div 
                        className="bg-zinc-900 border border-zinc-800 rounded-sm p-4 hover:border-zinc-700 transition-colors"
                        whileHover={{ scale: 1.02, borderColor: '#00c853' }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Ruler className="w-4 h-4 text-[#00c853]" />
                          <span className="text-zinc-500 text-xs uppercase tracking-wide">Espessura</span>
                        </div>
                        <p className="text-white font-medium">{product.specs.espessura}</p>
                      </motion.div>
                    )}
                    
                    {product.specs.comprimento && (
                      <motion.div 
                        className="bg-zinc-900 border border-zinc-800 rounded-sm p-4 hover:border-zinc-700 transition-colors"
                        whileHover={{ scale: 1.02, borderColor: '#00c853' }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Ruler className="w-4 h-4 text-[#00c853]" />
                          <span className="text-zinc-500 text-xs uppercase tracking-wide">Comprimento</span>
                        </div>
                        <p className="text-white font-medium">{product.specs.comprimento}</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <motion.footer 
        className="px-6 py-4 border-t border-zinc-800 text-center text-zinc-600 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        © 2026 Ribeiro & Moreira - Metal Services
      </motion.footer>
    </motion.div>
  );
};

export default ProductPage;
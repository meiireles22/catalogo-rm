import { useNavigate } from 'react-router-dom';
import { LogOut, Truck, Layers, Zap, Maximize2, User, Play } from 'lucide-react';
import { categories } from '@/data/products';
import { motion } from 'framer-motion';

const iconMap = {
  Truck: Truck,
  Layers: Layers,
  Zap: Zap,
  Maximize2: Maximize2
};

const Dashboard = ({ onLogout, isAdmin, username }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <img 
            src="https://customer-assets.emergentagent.com/job_mostruario-metal/artifacts/dyyus9dq_LOGOTIPO_VERDE_ASSINATURA%20%28002%29.png"
            alt="Logo"
            className="h-10 object-contain"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-sm ${isAdmin ? 'bg-[#00c853]/20 text-[#00c853]' : 'bg-blue-500/20 text-blue-400'}`}>
            <User className="w-4 h-4" />
            <span className="text-sm font-medium uppercase">{username}</span>
            <span className="text-xs opacity-70">({isAdmin ? 'Admin' : 'Comercial'})</span>
          </div>
          
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline uppercase text-sm tracking-wide">Sair</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-['Oswald'] uppercase tracking-wider mb-2">
            Catálogo
          </h1>
          <p className="text-zinc-400">Selecione uma categoria para explorar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon];
            return (
              <motion.div
                key={category.id}
                onClick={() => navigate(`/catalogo/${category.id}`)}
                className="cursor-pointer h-64 md:h-80 rounded-sm border border-zinc-800 bg-cover bg-center relative overflow-hidden group transition-all hover:border-[#00c853] hover:shadow-[0_0_40px_rgba(0,200,83,0.2)]"
                style={{ backgroundImage: `url('${category.image}')` }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-[#00c853]/30 transition-all" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-2">
                    {IconComponent && (
                      <div className="p-2 bg-[#00c853]/20 rounded-sm">
                        <IconComponent className="w-6 h-6 text-[#00c853]" />
                      </div>
                    )}
                    <h2 className="text-2xl md:text-3xl font-bold text-white font-['Oswald'] uppercase tracking-wide">
                      {category.name}
                    </h2>
                  </div>
                  <p className="text-zinc-300 text-sm md:text-base line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Botão Galeria de Vídeos */}
        <motion.div
          className="max-w-5xl mx-auto mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => navigate('/videos')}
            className="w-full bg-gradient-to-r from-red-900/30 to-red-600/30 border border-red-600/50 rounded-sm p-6 flex items-center justify-center gap-4 hover:from-red-900/50 hover:to-red-600/50 hover:border-red-500 hover:shadow-[0_0_40px_rgba(220,38,38,0.2)] transition-all group"
          >
            <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Play className="w-7 h-7 text-white ml-1" fill="white" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white font-['Oswald'] uppercase tracking-wide">
                Galeria de Vídeos
              </h3>
              <p className="text-zinc-400 text-sm">
                Veja os nossos processos de fabrico em ação
              </p>
            </div>
          </button>
        </motion.div>
      </main>

      <footer className="px-6 py-4 border-t border-zinc-800 text-center text-zinc-600 text-sm">
        © 2026 Ribeiro & Moreira - Metal Services | Catálogo Digital
      </footer>
    </div>
  );
};

export default Dashboard;
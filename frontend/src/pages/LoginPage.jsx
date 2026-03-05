import { useState } from 'react';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API } from '@/App';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        username,
        password
      });

      if (response.data.success) {
        onLogin(true, response.data.role, response.data.username);
      } else {
        setError('Credenciais inválidas');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Utilizador ou palavra-passe incorretos');
      } else {
        setError('Erro de conexão. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ 
          backgroundImage: `url('https://customer-assets.emergentagent.com/job_mostruario-metal/artifacts/e0seilmv_Captura%20de%20ecr%C3%A3%202026-01-19%20093647.png')` 
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70" />
      
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="backdrop-blur-xl bg-black/50 border border-zinc-800 rounded-sm p-8">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <img 
              src="https://customer-assets.emergentagent.com/job_mostruario-metal/artifacts/dyyus9dq_LOGOTIPO_VERDE_ASSINATURA%20%28002%29.png"
              alt="Ribeiro & Moreira Logo"
              className="h-20 object-contain"
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-zinc-700 rounded-sm pl-12 pr-4 py-4 text-white placeholder:text-zinc-500 focus:border-[#00c853] focus:outline-none transition-all"
                  placeholder="Utilizador"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-zinc-700 rounded-sm pl-12 pr-4 py-4 text-white placeholder:text-zinc-500 focus:border-[#00c853] focus:outline-none transition-all"
                  placeholder="Palavra-passe"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/50 border border-red-900/50 rounded-sm p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00c853] hover:bg-[#00e676] text-black font-bold uppercase tracking-wider py-4 rounded-sm transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          © 2026 Ribeiro & Moreira - Metal Services
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
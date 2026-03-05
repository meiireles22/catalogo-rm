// Dados de produtos do catálogo Ribeiro & Moreira

export const categories = [
  {
    id: 'carrocarias',
    name: 'Carroçarias',
    description: 'Soluções para carroçarias metálicas de veículos comerciais e industriais.',
    image: '/images/carrocarias.jpg',
    icon: 'Truck'
  },
  {
    id: 'remates',
    name: 'Remates',
    description: 'Acabamentos e remates metálicos de alta precisão para construção civil e industrial.',
    image: '/images/remates.jpg',
    icon: 'Layers'
  },
  {
    id: 'corte-laser',
    name: 'Corte Laser',
    description: 'Corte laser de alta precisão para peças complexas em diversos materiais metálicos.',
    image: '/images/quinagem.jpg',
    icon: 'Zap'
  },
  {
    id: 'quinagem',
    name: 'Quinagem',
    description: 'Quinagem de chapas metálicas com equipamentos de alta precisão.',
    image: '/images/corte-laser.jpg',
    icon: 'Maximize2'
  }
];

export const products = {
  carrocarias: [
    {
      id: 'car-001',
      name: 'Caixa Aberta Standard',
      description: 'Carroçaria em caixa aberta para transporte de materiais diversos. Estrutura reforçada em aço galvanizado.',
      specs: {
        material: '',
        espessura: '',
        comprimento: ''
      },
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
    },
    {
      id: 'car-002',
      name: 'Basculante Hidráulico',
      description: 'Sistema basculante com cilindro hidráulico para descarga rápida. Ideal para construção civil.',
      specs: {
        material: '',
        espessura: '',
        comprimento: ''
      },
      image: 'https://images.unsplash.com/photo-1586191583765-4cd5e5c6b6ee?w=800'
    },
    {
      id: 'car-003',
      name: 'Furgão Isotérmico',
      description: 'Carroçaria fechada com isolamento térmico para transporte de produtos sensíveis à temperatura.',
      specs: {
        material: '',
        espessura: '',
        comprimento: ''
      },
      image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800'
    }
  ],
  remates: [
    {
      id: 'rem-001',
      name: 'Rufo de Cumeeira',
      description: 'Remate para cumeeira de telhados metálicos. Acabamento perfeito com encaixe precisão.',
      specs: {
        material: '',
        espessura: '',
        comprimento: ''
      },
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
    },
    {
      id: 'rem-002',
      name: 'Caleira Perfilada',
      description: 'Caleira em chapa perfilada para escoamento de águas pluviais. Sistema anti-transbordo.',
      specs: {
        material: '',
        espessura: '',
        comprimento: ''
      },
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800'
    },
    {
      id: 'rem-003',
      name: 'Pingadeira de Janela',
      description: 'Acabamento inferior para vãos de janela. Protege contra infiltrações.',
      specs: {
        material: '',
        espessura: '',
        comprimento: ''
      },
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
    }
  ],
  'corte-laser': [
    {
      id: 'las-001',
      name: 'Peças Decorativas',
      description: 'Corte laser de peças decorativas personalizadas para arquitetura e design.',
      specs: {
        material: '',
        espessura: '',
        comprimento: ''
      },
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'
    },
    {
      id: 'las-002',
      name: 'Componentes Industriais',
      description: 'Fabrico de componentes industriais de alta precisão por corte laser.',
      specs: {
        material: '',
        espessura: '',
        comprimento: ''
      },
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'
    },
    {
      id: 'las-003',
      name: 'Chapas Perfuradas',
      description: 'Chapas com padrões perfurados para fachadas, vedações e aplicações acústicas.',
      specs: {
        material: '',
        espessura: '',
        comprimento: ''
      },
      image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800'
    }
  ],
  quinagem: [
    {
      id: 'qui-001',
      name: 'Perfis em U e L',
      description: 'Quinagem de perfis em U e L para estruturas metálicas e construção.',
      specs: {
        material: '',
        espessura: '',
        comprimento: ''
      },
      image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800'
    },
    {
      id: 'qui-002',
      name: 'Caixas e Gavetas',
      description: 'Fabrico de caixas e gavetas metálicas por quinagem CNC de alta precisão.',
      specs: {
        material: '',
        espessura: '',
        comprimento: ''
      },
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'
    },
    {
      id: 'qui-003',
      name: 'Painéis Arquitectónicos',
      description: 'Quinagem de painéis para fachadas e revestimentos arquitectónicos.',
      specs: {
        material: '',
        espessura: '',
        comprimento: ''
      },
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
    }
  ]
};

export const getCategory = (id) => categories.find(cat => cat.id === id);
export const getProducts = (categoryId) => products[categoryId] || [];
export const getProduct = (categoryId, productId) => {
  const categoryProducts = products[categoryId] || [];
  return categoryProducts.find(p => p.id === productId);
};
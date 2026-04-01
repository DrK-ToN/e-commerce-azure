import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import Admin from './pages/Admin';
import Produtos from './pages/Produtos';
import Carrinho from './pages/Carrinho';
import Checkout from './pages/Checkout';
import EditarProduto from './pages/EditarProduto';

// --- NOVAS IMPORTAÇÕES PARA GESTÃO SEPARADA ---
import GerenciarProdutos from './pages/GerenciarProdutos';
import GerenciarClientes from './pages/GerenciarClientes';
import GerenciarPedidos from './pages/GerenciarPedidos';

import './index.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Rotas Públicas e de Cliente */}
        <Route path="/" element={<Home />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Rota do Dashboard Principal (Onde estão os cards e a mão de cromo) */}
        <Route path="/admin" element={<Admin />} />

        {/* Sub-rotas de Gerenciamento do Admin */}
        <Route path="/admin/produtos" element={<GerenciarProdutos />} />
        <Route path="/admin/clientes" element={<GerenciarClientes />} />
        <Route path="/admin/pedidos" element={<GerenciarPedidos />} />
        
        {/* Rota de Edição (Recebe o ID do produto) */}
        <Route path="/admin/editar/:id" element={<EditarProduto />} />
      </Routes>
    </Router>
  );
}

export default App;
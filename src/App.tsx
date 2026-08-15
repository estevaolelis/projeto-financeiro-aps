import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Calculadora from './pages/Calculadora';
import PerfilInvestidor from './pages/PerfilInvestidor';
import Videos from './pages/Videos';
import FAQ from './pages/FAQ';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen w-full bg-slate-950 text-white">
        <Navbar />
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculadora" element={<Calculadora />} />
            <Route path="/perfil" element={<PerfilInvestidor />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/faq" element={<FAQ />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
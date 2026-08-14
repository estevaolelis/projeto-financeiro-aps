import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  TrendingUp, 
  Calculator, 
  UserCheck,
  VideoIcon, 
  HelpCircle, 
  Menu, 
  X 
} from 'lucide-react';


export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)

    const navItems = [
        { name: 'Início', path: '/', icon: TrendingUp },
        { name: 'Calculadora', path: '/calculadora', icon: Calculator },
        { name: 'Perfil de Investidor', path: '/perfil', icon: UserCheck },
        { name: 'Vídeos', path: '/videos', icon: VideoIcon },
        { name: 'Dúvidas (FAQ)', path: '/faq', icon: HelpCircle },
    ]

    const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-600 text-white shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

    const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
      isActive
        ? 'bg-indigo-600 text-white font-semibold'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

    return (
    <nav className="bg-slate-950 border-b border-slate-950 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <NavLink to="/" className="flex items-center gap-2 font-bold text-xl text-slate-800">
            <div className="bg-indigo-500 text-white p-2 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-white">Finanças<span className="text-emerald-600">App</span></span>
          </NavLink>

          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} className={linkClass}>
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="text-slate-600 hover:text-slate-900 focus:outline-none p-2 rounded-md hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={mobileLinkClass}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </nav>
  );
}
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, CheckCircle2, LockKeyhole, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login, register, saveSession } from '../services/api';

type Mode = 'login' | 'register';

export default function Acesso() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setError('');
    setSuccess('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(nome, email, senha);
        setMode('login');
        setSenha('');
        setSuccess('Cadastro realizado. Agora entre com seus dados.');
      } else {
        const session = await login(email, senha);
        saveSession(session);
        navigate('/');
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível concluir a operação.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-5xl items-center gap-10 py-8 lg:grid-cols-[1fr_420px]">
      <div className="hidden lg:block">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-indigo-300">Sua vida financeira, com clareza</p>
        <h1 className="max-w-xl text-5xl font-black leading-[1.05] text-white">Um lugar seguro para cuidar dos seus planos.</h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">Crie sua conta para acompanhar suas decisões financeiras e manter seus dados organizados em um só lugar.</p>
        <div className="mt-8 space-y-4 text-sm text-slate-300">
          <p className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-400" /> Seus dados ficam separados por usuário</p>
          <p className="flex items-center gap-3"><LockKeyhole className="h-5 w-5 text-emerald-400" /> Senha armazenada com proteção</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20 sm:p-8">
        <div className="mb-8 flex gap-2 rounded-xl bg-slate-950 p-1">
          <button type="button" onClick={() => changeMode('login')} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Entrar</button>
          <button type="button" onClick={() => changeMode('register')} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Criar conta</button>
        </div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">{mode === 'login' ? 'Bem-vindo de volta' : 'Comece sua jornada'}</h2>
          <p className="mt-2 text-sm text-slate-400">{mode === 'login' ? 'Entre para acessar seu espaço financeiro.' : 'Preencha seus dados para criar seu acesso.'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && <label className="block text-sm font-medium text-slate-300">Nome<input required minLength={2} maxLength={100} value={nome} onChange={(event) => setNome(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400" placeholder="Como podemos chamar você?" /></label>}
          <label className="block text-sm font-medium text-slate-300">E-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400" placeholder="voce@email.com" /></label>
          <label className="block text-sm font-medium text-slate-300">Senha<input required minLength={mode === 'register' ? 8 : 1} maxLength={72} type="password" value={senha} onChange={(event) => setSenha(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400" placeholder={mode === 'register' ? 'Mínimo de 8 caracteres' : 'Sua senha'} /></label>
          {error && <p role="alert" className="rounded-lg border border-rose-900/70 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{error}</p>}
          {success && <p role="status" className="rounded-lg border border-emerald-900/70 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300">{success}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">
            {mode === 'login' ? <LockKeyhole className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar na conta' : 'Criar minha conta'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </section>
  );
}
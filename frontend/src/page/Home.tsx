import React, { useState } from "react";
import { useTheme } from "../context/ThemeProvider";
import { Sun, Moon, Menu, X, Zap, Shield, TrendingUp, EyeOff, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// MOCK DATA: Преимущества (Автономная работа)
const MOCK_FEATURES = [
  { id: "1", icon: EyeOff, title: "Абсолютная невидимость", text: "Интерфейс очищен от визуального шума. Только ваши деньги и ничего лишнего." },
  { id: "2", icon: Zap, title: "Моментальные переводы", text: "Отправка средств по всему миру за доли секунды без скрытых комиссий." },
  { id: "3", icon: Shield, title: "Криптографическая защита", text: "Ваши биометрические данные и средства защищены передовыми протоколами шифрования." },
  { id: "4", icon: TrendingUp, title: "Умная аналитика", text: "Искусственный интеллект незаметно анализирует траты и помогает сберегать больше." }
];

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const handleAuth = () => {
    // TODO: API_INTEGRATION: [POST /api/v1/auth/login или переход на страницу входа]
    navigate("/login");
    };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-50 antialiased selection:bg-blue-500/30">
      
      {/* 1. НАВБАР */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-black/75 border-b border-slate-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer active:scale-98 transition-transform">
            <div className="h-7 w-7 rounded-lg bg-blue-600 dark:bg-zinc-50 flex items-center justify-center">
              <div className="h-3 w-3 bg-white dark:bg-black rounded-full" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              BankOf<span className="text-blue-600 dark:text-zinc-400">Nothing</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-zinc-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-zinc-50 transition-colors">Продукты</a>
            <a href="#features" className="hover:text-slate-900 dark:hover:text-zinc-50 transition-colors">Технологии</a>
            <a href="#features" className="hover:text-slate-900 dark:hover:text-zinc-50 transition-colors">Безопасность</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 cursor-pointer"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button onClick={handleAuth} className="px-4 py-2 text-sm font-medium rounded-xl text-white bg-slate-900 hover:bg-slate-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 shadow-sm transition-all active:scale-95 cursor-pointer">
              Войти в банк
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="p-2 rounded-xl text-slate-800 dark:text-zinc-200">
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-xl text-slate-800 dark:text-zinc-200 cursor-pointer">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Мобильное меню */}
        {isOpen && (
          <div className="md:hidden border-b border-slate-100 dark:border-zinc-900 bg-white dark:bg-black px-4 pt-2 pb-6 space-y-4">
            <a href="#features" onClick={() => setIsOpen(false)} className="block py-2 text-base font-medium text-slate-600 dark:text-zinc-400">Продукты</a>
            <a href="#features" onClick={() => setIsOpen(false)} className="block py-2 text-base font-medium text-slate-600 dark:text-zinc-400">Технологии</a>
            <a href="#features" onClick={() => setIsOpen(false)} className="block py-2 text-base font-medium text-slate-600 dark:text-zinc-400">Безопасность</a>
            <button onClick={() => { setIsOpen(false); handleAuth(); }} className="w-full text-center px-4 py-3 text-base font-medium rounded-xl text-white bg-slate-900 dark:bg-zinc-50 dark:text-black cursor-pointer">
              Войти в банк
            </button>
          </div>
        )}
      </nav>

      {/* 2. HERO СЕКЦИЯ */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-32 sm:pb-24">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 dark:bg-zinc-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Банкинг, очищенный <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-zinc-50 dark:via-zinc-300 dark:to-zinc-600">
              от лишнего шума
            </span>
          </h1>
          <p className="text-base sm:text-xl text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Абсолютный контроль над вашими финансами в ультра-минималистичном исполнении. Никаких навязчивых предложений, только кристальная прозрачность.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={handleAuth} className="w-full sm:w-auto px-8 py-4 text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-2 group shadow-md cursor-pointer">
              Открыть счет в Nothing
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a href="#features" className="w-full sm:w-auto px-8 py-4 text-base font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all text-center active:scale-95">
              Узнать больше
            </a>
          </div>
        </div>
      </section>

      {/* 3. КАРТОЧКИ ПРЕИМУЩЕСТВ */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-100 dark:border-zinc-900">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4">Философия функциональности</h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-zinc-400">Мы убрали все элементы, которые отвлекают вас от управления капиталом.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.id} className="group relative p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900/50 hover:border-slate-200 dark:hover:border-zinc-800 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 flex items-center justify-center mb-6 group-hover:bg-blue-50 dark:group-hover:bg-zinc-800/80 transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-zinc-200 transition-colors">{feat.title}</h3>
                <p className="text-sm sm:text-base text-slate-500 dark:text-zinc-400 leading-relaxed">{feat.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. ФУТЕР */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-100 dark:border-zinc-900 text-center md:flex md:items-center md:justify-between text-xs sm:text-sm text-slate-400 dark:text-zinc-600">
        <p>© {new Date().getFullYear()} BankOfNothing. Все права защищены (Пет-проект).</p>
        <div className="flex justify-center gap-6 mt-4 md:mt-0">
          <span className="hover:text-slate-600 dark:hover:text-zinc-400 cursor-pointer">Политика приватности</span>
          <span className="hover:text-slate-600 dark:hover:text-zinc-400 cursor-pointer">Условия использования</span>
        </div>
      </footer>

    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";
import { Sun, Moon, Menu, X, Zap, Shield, TrendingUp, EyeOff, ArrowRight } from "lucide-react";

// MOCK DATA (Автономная работа)
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

  return (
    <div className="nothing-page">
      
      {/* 1. НАВБАР */}
      <nav className="nothing-nav sm:h-20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="h-7 w-7 rounded-lg bg-blue-600 dark:bg-zinc-50 flex items-center justify-center">
            <div className="h-3 w-3 bg-white dark:bg-black rounded-full" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            BankOf<span className="text-blue-600 dark:text-zinc-400">Nothing</span>
          </span>
        </div>

        {/* Ссылки (Десктоп) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium opacity-70">
          <a href="#features" className="hover:opacity-100 transition-opacity">Продукты</a>
          <a href="#features" className="hover:opacity-100 transition-opacity">Технологии</a>
          <a href="#features" className="hover:opacity-100 transition-opacity">Безопасность</a>
        </div>

        {/* Управление (Десктоп) */}
        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="nothing-btn-icon">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <button onClick={() => navigate("/login")} className="px-4 py-2 text-sm font-medium rounded-xl text-white bg-slate-900 hover:bg-slate-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 shadow-sm transition-all active:scale-95 cursor-pointer">
            Войти в банк
          </button>
        </div>

        {/* Мобильный триггер */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="nothing-btn-icon">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="nothing-btn-icon">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Выпадающее мобильное меню */}
        {isOpen && (
          <div className="absolute top-16 left-0 w-full border-b border-current/10 bg-slate-50 dark:bg-black px-4 pt-2 pb-6 space-y-4 flex flex-col z-50">
            <a href="#features" onClick={() => setIsOpen(false)} className="block py-2 text-base font-medium opacity-70">Продукты</a>
            <a href="#features" onClick={() => setIsOpen(false)} className="block py-2 text-base font-medium opacity-70">Технологии</a>
            <a href="#features" onClick={() => setIsOpen(false)} className="block py-2 text-base font-medium opacity-70">Безопасность</a>
            <button onClick={() => { setIsOpen(false); navigate("/login"); }} className="w-full text-center px-4 py-3 text-base font-medium rounded-xl text-white bg-slate-900 dark:bg-zinc-50 dark:text-black cursor-pointer">
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
          <p className="text-base sm:text-xl opacity-60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Абсолютный контроль над вашими финансами в ультра-минималистичном исполнении. Никаких навязчивых предложений, только кристальная прозрачность.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate("/login")} className="nothing-btn-cta group">
              Открыть счет в Nothing
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a href="#features" className="nothing-btn-secondary">
              Узнать больше
            </a>
          </div>
        </div>
      </section>

      {/* 3. КАРТОЧКИ ПРЕИМУЩЕСТВ */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-current/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4">Философия функциональности</h2>
          <p className="text-sm sm:text-base opacity-60">Мы убрали все элементы, которые отвлекают вас от управления капиталом.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.id} className="nothing-feature-card">
                <div className="h-12 w-12 rounded-xl bg-current/5 flex items-center justify-center mb-6 group-hover:bg-blue-600/10 dark:group-hover:bg-zinc-50/10 transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-zinc-400 transition-colors">{feat.title}</h3>
                <p className="text-sm sm:text-base opacity-60 leading-relaxed">{feat.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. ФУТЕР */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-current/10 text-center md:flex md:items-center md:justify-between text-xs sm:text-sm opacity-50">
        <p>© {new Date().getFullYear()} BankOfNothing. Все права защищены (Пет-проект).</p>
        <div className="flex justify-center gap-6 mt-4 md:mt-0">
          <span className="hover:underline cursor-pointer">Политика приватности</span>
          <span className="hover:underline cursor-pointer">Условия использования</span>
        </div>
      </footer>

    </div>
  );
}

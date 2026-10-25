import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";
import { Sun, Moon, ArrowLeft, Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";

export default function Login() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Локальные состояния формы
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Базовая валидация на клиенте
    if (!email || !password) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    setIsLoading(true);

    // Имитируем задержку сети для проверки лоадера (автономный режим)
    setTimeout(() => {
      setIsLoading(false);
      
      // Имитация успешного входа на моках
      if (email === "demo@nothing.bank" && password === "password123") {
        // TODO: API_INTEGRATION: [POST /api/v1/auth/login. Ожидается LoginRequest DTO { email, password }. В ответ получаем JWT токен и сохраняем в localStorage]
        navigate("/dashboard"); // Перенаправление на будущий дашборд
      } else {
        setError("Неверный email или пароль. Используйте: demo@nothing.bank / password123");
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-50 antialiased flex flex-col justify-between selection:bg-blue-500/30">
      
      {/* Шапка формы */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-50 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          На главную
        </button>

        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 cursor-pointer"
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      </header>

      {/* Центральный блок авторизации */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-950 p-8 rounded-2xl border border-slate-100 dark:border-zinc-900/50 shadow-sm transition-all duration-300">
          
          {/* Заголовок */}
          <div className="text-center">
            <div className="inline-flex h-10 w-10 rounded-xl bg-blue-600 dark:bg-zinc-50 items-center justify-center mb-4">
              <div className="h-4 w-4 bg-white dark:bg-black rounded-full" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Войдите в кабинет</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
              Управляйте тем, чего не существует
            </p>
          </div>

          {/* Форма */}
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            
            {/* Вывод ошибки */}
            {error && (
              <div className="p-3 rounded-xl text-xs sm:text-sm font-medium bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}

            {/* Поле Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-500 dark:text-zinc-400 tracking-wider uppercase pl-1">
                Email адрес
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-zinc-500 disabled:opacity-50 transition-all"
                />
              </div>
            </div>

            {/* Поле Пароля */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center pl-1">
                <label htmlFor="password" className="text-xs font-semibold text-slate-500 dark:text-zinc-400 tracking-wider uppercase">
                  Пароль
                </label>
                <span className="text-xs text-blue-600 dark:text-zinc-400 hover:underline cursor-pointer">
                  Забыли?
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-zinc-500 disabled:opacity-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Кнопка отправки формы */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Проверка данных...
                </>
              ) : (
                "Продолжить"
              )}
            </button>
          </form>

          {/* Информационная подсказка для автономного тестирования */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-900 text-center">
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              Для теста: <span className="font-mono text-slate-600 dark:text-zinc-300">demo@nothing.bank</span> / <span className="font-mono text-slate-600 dark:text-zinc-300">password123</span>
            </p>
          </div>

        </div>
      </main>

      {/* Компактный футер */}
      <footer className="py-6 text-center text-xs text-slate-400 dark:text-zinc-600">
        <p>© {new Date().getFullYear()} BankOfNothing. Защищено заглушками.</p>
      </footer>

    </div>
  );
}

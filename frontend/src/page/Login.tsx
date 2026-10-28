import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";
import { Sun, Moon, ArrowLeft, Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { AuthControllerService, OpenAPI } from "../api";

export default function Login() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const requestDate = {email,password};
    if (!email || !password) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    setIsLoading(true);
    AuthControllerService.login(requestDate).then(
      (response)=>{ 
        const token = response.token
        if(token){
          localStorage.setItem("token",token);
          OpenAPI.TOKEN = token;
        }
        navigate("/dashboard")}
    ).catch((err)=>{setError(err.message ||"Произошла ошибка при входе")})
    .finally(()=>setIsLoading(false));

  };

  const  handleClick=(e: React.MouseEvent)=>{
    e.preventDefault();
    navigate('/register');
  }

  return (
    <div className="nothing-page flex flex-col justify-between">
      
      {/* ШАПКА ФОРМЫ */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          На главную
        </button>

        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="nothing-btn-icon">
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      </header>

      {/* ФОРМА АВТОРИЗАЦИИ */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="nothing-auth-card">
          
          <div className="text-center">
            <div className="inline-flex h-10 w-10 rounded-xl bg-blue-600 dark:bg-zinc-50 items-center justify-center mb-4">
              <div className="h-4 w-4 bg-white dark:bg-black rounded-full" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Войдите в кабинет</h2>
            <p className="mt-2 text-sm opacity-60">Управляйте тем, чего не существует</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-xl text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                {error}
              </div>
            )}

            {/* Поле Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="nothing-form-label">Email адрес</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                <input
                  id="email"
                  type="email"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="nothing-form-input"
                />
              </div>
            </div>

            {/* Поле Пароля */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center pl-1">
                <label htmlFor="password" className="nothing-form-label">Пароль</label>
                <span className="text-xs text-blue-600 dark:text-zinc-400 hover:underline cursor-pointer opacity-80 hover:opacity-100">Забыли?</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="nothing-form-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-current opacity-40 hover:opacity-70"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Кнопка отправки */}
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
                "Войти"
              )}
            </button>
            <button 
                    className="w-full mt-2 py-3.5 px-4 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 cursor-pointer"
                    type="button"
                    onClick={handleClick}
            >
              Регистрация
            </button>
          </form>

          <div className="pt-4 border-t border-current/10 text-center">
            <p className="text-xs opacity-50">
              Для теста: <span className="font-mono opacity-100 font-bold">demo@nothing.bank</span> / <span className="font-mono opacity-100 font-bold">password123</span>
            </p>
          </div>

        </div>
      </main>

      <footer className="py-6 text-center text-xs opacity-40">
        <p>© {new Date().getFullYear()} BankOfNothing. Защищено заглушками.</p>
      </footer>

    </div>
  );
}

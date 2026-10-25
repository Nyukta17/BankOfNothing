import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";
import { Sun, Moon, LogOut, Plus, Send, DollarSign, TrendingUp, ArrowUpRight, ArrowDownLeft } from "lucide-react";

const MOCK_USER = { name: "Максим И.", total: "1,240,500.00 ₽" };
const MOCK_ACCOUNTS = [
  { id: "1", name: "Основной счет", num: "•••• 4321", val: "840,000.00 ₽", type: "VISA" },
  { id: "2", name: "Сберегательный", num: "•••• 8899", val: "400,500.00 ₽", type: "MIR" }
];
const MOCK_TX = [
  { id: "1", title: "Доставка еды", cat: "Рестораны", amt: "-1,200.00 ₽", date: "Сегодня", inc: false },
  { id: "2", title: "Зачисление зарплаты", cat: "Работа", amt: "+70,000.00 ₽", date: "Вчера", inc: true },
  { id: "3", title: "Перевод от Олега", cat: "Переводы", amt: "+5,000.00 ₽", date: "22 Окт", inc: true }
];

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-zinc-50 antialiased selection:bg-blue-500/30">
      
      {/* ШАПКА */}
      <nav className="sticky top-0 z-40 backdrop-blur-md border-b border-current/10 h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="h-5 w-5 rounded bg-blue-600 dark:bg-zinc-50" />
          <span className="font-bold text-sm tracking-tight">BankOfNothing</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="opacity-60 mr-2 hidden sm:inline">{MOCK_USER.name}</span>
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="p-2 rounded-xl hover:bg-current/5 cursor-pointer">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <button onClick={() => navigate("/login")} className="p-2 rounded-xl hover:bg-red-500/10 text-red-500 cursor-pointer">
            {/* TODO: API_INTEGRATION: [POST /api/v1/auth/logout для сброса токена] */}
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* ОСНОВНОЙ БЛОК */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="mb-8">
          <p className="text-xs font-semibold opacity-50 tracking-wider uppercase mb-1">Общий баланс</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{MOCK_USER.total}</h1>
          {/* TODO: API_INTEGRATION: [GET /api/v1/accounts/summary] */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
          
          {/* ЛЕВАЯ КОЛОНКА: СЧЕТА */}
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold">Ваши счета</h2>
              <button onClick={() => alert("Операция: Новый счет")} className="px-2 py-1 rounded-lg bg-current/5 text-xs font-medium flex items-center gap-1 cursor-pointer hover:bg-current/10 transition-colors">
                <Plus className="h-3 w-3" /> Новый
              </button>
            </div>
            
            {MOCK_ACCOUNTS.map((acc) => (
              <div key={acc.id} className="p-6 rounded-2xl border border-current/10 hover:border-current/20 transition-all flex flex-col justify-between h-36 w-full shadow-xs">
                <div className="flex justify-between items-start w-full">
                  <div>
                    <h3 className="font-bold text-sm">{acc.name}</h3>
                    <p className="text-xs opacity-50 mt-0.5">{acc.num}</p>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-current/10 font-medium opacity-60">{acc.type}</span>
                </div>
                <p className="text-xl font-extrabold tracking-tight">{acc.val}</p>
              </div>
            ))}
          </div>

          {/* ПРАВАЯ КОЛОНКА: ОПЕРАЦИИ И ИСТОРИЯ */}
          <div className="lg:col-span-2 space-y-6 w-full">
            
            {/* КНОПКИ ДЕЙСТВИЙ */}
            <div className="p-6 rounded-2xl border border-current/10 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full shadow-xs">
              {[
                { name: "Перевести", icon: Send, color: "text-blue-600 dark:text-blue-400" },
                { name: "Пополнить", icon: Plus, color: "text-emerald-600 dark:text-emerald-400" },
                { name: "Обмен", icon: DollarSign, color: "text-indigo-600 dark:text-indigo-400" },
                { name: "Анализ", icon: TrendingUp, color: "text-purple-600 dark:text-purple-400" }
              ].map((btn) => (
                <button key={btn.name} onClick={() => alert(`Операция: ${btn.name}`)} className="p-4 w-full rounded-xl border border-current/10 hover:bg-current/5 flex flex-col items-center justify-center gap-2 font-medium text-xs transition-all active:scale-95 cursor-pointer text-center">
                  <btn.icon className={`h-4 w-4 ${btn.color}`} />
                  <span>{btn.name}</span>
                </button>
              ))}
            </div>

            {/* СПИСОК ТРАНЗАКЦИЙ */}
            <div className="space-y-3 w-full">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-base font-bold">Последняя активность</h2>
                <span className="text-xs text-blue-600 dark:text-zinc-400 hover:underline cursor-pointer">Смотреть все</span>
                {/* TODO: API_INTEGRATION: [GET /api/v1/transactions с Pageable] */}
              </div>
              
              <div className="border border-current/10 rounded-2xl p-3 space-y-1 shadow-xs w-full">
                {MOCK_TX.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-current/5 transition-colors cursor-pointer w-full">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${tx.inc ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-current/5 opacity-80"}`}>
                        {tx.inc ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{tx.title}</h4>
                        <p className="text-xs opacity-50 mt-0.5">{tx.cat} • {tx.date}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${tx.inc ? "text-emerald-600 dark:text-emerald-400" : ""}`}>{tx.amt}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

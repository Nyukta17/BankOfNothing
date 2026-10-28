import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";
import { Sun, Moon, ArrowLeft, Send, Loader2, CheckCircle2, XCircle } from "lucide-react";

const MOCK_ACCOUNTS = [
  { id: "1", name: "Основной счет (VISA)", val: 840000.00, displayBal: "840,000.00 ₽" },
  { id: "2", name: "Сберегательный (MIR)", val: 400500.00, displayBal: "400,500.00 ₽" }
];

type TransferStatus = "idle" | "success" | "error";

export default function Transfer() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Состояния формы и статуса транзакции
  const [selectedAccId, setSelectedAccId] = useState(MOCK_ACCOUNTS[0].id);
  const [recipientCard, setRecipientCard] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<TransferStatus>("idle");

  const activeAccount = MOCK_ACCOUNTS.find(a => a.id === selectedAccId);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!recipientCard || !amount) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Введите корректную сумму перевода");
      return;
    }

    if (activeAccount && numAmount > activeAccount.val) {
      setError("Недостаточно средств на выбранном счете");
      return;
    }

    setIsLoading(true);

    // Имитация ответа от бэкенда Spring Boot
    setTimeout(() => {
      setIsLoading(false);
      
      // Имитируем логику успеха/ошибки на моках:
      // Если сумма ровно 777 — симулируем ошибку сети/бэка для проверки интерфейса
      if (numAmount === 777) {
        // TODO: API_INTEGRATION: [Обработка ошибок от POST /api/v1/transfers, например 400 Bad Request или 500 Серверная ошибка]
        setStatus("error");
      } else {
        // TODO: API_INTEGRATION: [POST /api/v1/transfers. Отправка DTO { sourceAccountId, targetCardNumber, amount }. Ожидаем 200 OK]
        setStatus("success");
      }
    }, 1500);
  };

  return (
    <div className="nothing-page flex flex-col justify-between">
      
      {/* ШАПКА */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm font-medium opacity-60 hover:opacity-100 cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          В личный кабинет
        </button>
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="nothing-btn-icon">
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </header>

      {/* ОСНОВНОЙ ПРОВАЙДЕР СТАТУСОВ */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="nothing-auth-card">
          
          {/* СОСТОЯНИЕ 1: ФОРМА ВВОДА (IDLE) */}
          {status === "idle" && (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-extrabold tracking-tight">Перевод по номеру карты</h2>
                <p className="mt-1 text-xs opacity-60">Моментальное списание без скрытых комиссий</p>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleTransfer}>
                {error && (
                  <div className="p-3 rounded-xl text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="nothing-form-label">Списать со счета</label>
                  <select
                    disabled={isLoading}
                    value={selectedAccId}
                    onChange={(e) => setSelectedAccId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-current/10 bg-current/5 text-sm focus:outline-none text-current cursor-pointer"
                  >
                    {MOCK_ACCOUNTS.map(a => (
                      <option key={a.id} value={a.id} className="dark:bg-zinc-950 dark:text-zinc-50">
                        {a.name} — {a.displayBal}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="recipient" className="nothing-form-label">Номер карты получателя</label>
                  <input
                    id="recipient"
                    type="text"
                    disabled={isLoading}
                    value={recipientCard}
                    onChange={(e) => setRecipientCard(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    className="nothing-form-input pl-4!"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="amount" className="nothing-form-label">Сумма перевода (₽)</label>
                  <input
                    id="amount"
                    type="number"
                    disabled={isLoading}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="nothing-form-input pl-4!"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 px-4 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Обработка транзакции...
                    </>
                  ) : (
                    <>
                      Подтвердить перевод
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* СОСТОЯНИЕ 2: УСПЕШНЫЙ ПЕРЕВОД */}
          {status === "success" && (
            <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-emerald-500 scale-90 animate-bounce" style={{ animationIterationCount: 1, animationDuration: '0.6s' }} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Перевод выполнен</h2>
                <p className="mt-2 text-sm opacity-60">Средства успешно списаны и отправлены получателю.</p>
              </div>
              <div className="p-4 rounded-xl bg-current/5 border border-current/5 text-left text-xs space-y-2">
                <p><span className="opacity-50">Сумма:</span> {parseFloat(amount).toLocaleString()} ₽</p>
                <p><span className="opacity-50">Карта получателя:</span> {recipientCard}</p>
              </div>
              <button 
                onClick={() => navigate("/dashboard")} 
                className="w-full py-3 px-4 text-sm font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 cursor-pointer shadow-sm"
              >
                Вернуться в дашборд
              </button>
            </div>
          )}

          {/* СОСТОЯНИЕ 3: ОШИБКА ОПЕРАЦИИ */}
          {status === "error" && (
            <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-center">
                <XCircle className="h-16 w-16 text-red-500 animate-shake" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Ошибка перевода</h2>
                <p className="mt-2 text-sm opacity-60">Не удалось провести операцию. Бэкенд вернул ошибку обработки транзакции.</p>
              </div>
              <button 
                onClick={() => setStatus("idle")} 
                className="w-full py-3 px-4 text-sm font-semibold rounded-xl border border-current/10 hover:bg-current/5 cursor-pointer"
              >
                Повторить попытку
              </button>
            </div>
          )}

        </div>
      </main>

      <footer className="py-6 text-center text-xs opacity-40">
        <p>© {new Date().getFullYear()} BankOfNothing. Интерактивные статусы.</p>
      </footer>

    </div>
  );
}

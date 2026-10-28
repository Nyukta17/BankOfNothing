import React, { useState } from "react";
import { X, Loader2, Plus } from "lucide-react";
import { AccountControllerService } from "../api";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Функция для триггера рефетча счетов на дашборде
}

export default function CreateAccountModal({ isOpen, onClose, onSuccess }: CreateAccountModalProps) {
  const [currency, setCurrency] = useState("RUB");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    AccountControllerService.create({
    currency: currency 
  })
    .then(() => {
      onSuccess(); // Триггерим обновление списка счетов на дашборде
      onClose();   // Закрываем модальное окно
    })
    .catch((err) => {
      setError(err.message || "Не удалось открыть счет");
    })
    .finally(() => setIsLoading(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Задний полупрозрачный фон с размытием */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-xs" onClick={onClose} />
      
      {/* Контейнер модалки на базе токенов авторизации (идеально по размерам) */}
      <div className="nothing-auth-card bg-slate-50 dark:bg-zinc-950 relative z-10 w-full max-w-sm m-0 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Кнопка закрытия */}
        <button onClick={onClose} className="nothing-btn-icon absolute right-4 top-4 opacity-50 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <h2 className="text-xl font-extrabold tracking-tight">Новый продукт</h2>
          <p className="mt-1 text-xs opacity-60">Открытие счета происходит моментально</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 rounded-xl text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Выбор Валюты */}
          <div className="space-y-1.5">
            <label className="nothing-form-label">Валюта счета</label>
            <select
              disabled={isLoading}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-current/10 bg-current/5 text-sm focus:outline-none text-current cursor-pointer"
            >
              <option value="RUB" className="dark:bg-zinc-950">Российский рубль (RUB)</option>
              <option value="USD" className="dark:bg-zinc-950">Доллар США (USD)</option>
              <option value="EUR" className="dark:bg-zinc-950">Евро (EUR)</option>
              <option value="CNY" className="dark:bg-zinc-950">Китайский юань (CNY)</option>
            </select>
          </div>

          {/* Кнопка подтверждения */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Открытие счета...
              </>
            ) : (
              <>
                Открыть счет
                <Plus className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

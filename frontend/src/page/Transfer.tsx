import React, { useState, useEffect } from "react";
import { X, Loader2, Send } from "lucide-react";

// Делаем типы совместимыми с AccountResponse из твоего API
export type AccountOption = {
  id?: number;
  number?: string;
  currency?: string;
  balance?: number | string; // Бэк может отдавать BigDecimal как строку
};

export type SimpleTransferRequest = {
  fromAccountId: number;
  toAccountId: number; // <-- Добавили, чтобы TypeScript не ругался
  toAccountNumber: string;
  amount: number;
  idempotencyKey: string;
};

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccounts: AccountOption[];
  onTransferSubmit: (requestData: SimpleTransferRequest) => Promise<void>;
}

export default function TransferModal({ isOpen, onClose, userAccounts, onTransferSubmit }: TransferModalProps) {
  const [fromAccountId, setFromAccountId] = useState<string>("");
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && userAccounts.length > 0 && !fromAccountId) {
      // Берем id первого счета, если он есть
      const firstId = userAccounts[0]?.id;
      if (firstId) setFromAccountId(firstId.toString());
    }
  }, [isOpen, userAccounts, fromAccountId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numAmount = parseFloat(amount);
    const cleanAccountNumber = toAccountNumber.trim();

    if (!fromAccountId || !cleanAccountNumber || isNaN(numAmount) || numAmount <= 0) {
      setError("Пожалуйста, заполните все поля корректно");
      return;
    }

    if (cleanAccountNumber.length !== 20 || !/^\d+$/.test(cleanAccountNumber)) {
      setError("Номер счета должен состоять из 20 цифр");
      return;
    }

    const selectedAcc = userAccounts.find(a => a.id?.toString() === fromAccountId);
    // Приводим баланс к числу для проверки
    const currentBalance = Number(selectedAcc?.balance) || 0;

    if (currentBalance < numAmount) {
      setError("Недостаточно средств на выбранном счете");
      return;
    }

    setIsLoading(true);

    try {
      const requestData: SimpleTransferRequest = {
        fromAccountId: Number(fromAccountId),
        toAccountId: 0,
        toAccountNumber: cleanAccountNumber,
        amount: numAmount,
        idempotencyKey: crypto.randomUUID()
      };

      await onTransferSubmit(requestData);

      setToAccountNumber("");
      setAmount("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Ошибка при переводе");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAccount = userAccounts.find(a => a.id?.toString() === fromAccountId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-xs" onClick={onClose} />

      <div className="nothing-auth-card bg-slate-50 dark:bg-zinc-950 relative z-10 w-full max-w-sm m-0 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="nothing-btn-icon absolute right-4 top-4 opacity-50 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <h2 className="text-xl font-extrabold tracking-tight">Перевод по счету</h2>
          <p className="mt-1 text-xs opacity-60">Перевод на счет другого клиента</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 rounded-xl text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          {/* Выбор счета списания */}
          <div className="space-y-1.5">
            <label htmlFor="from-account" className="nothing-form-label">Списать со счета</label>
            <select
              id="from-account"
              disabled={isLoading || userAccounts.length === 0}
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="nothing-form-input pl-4! bg-transparent"
              required
            >
              {userAccounts.length === 0 && <option value="">Нет доступных счетов</option>}
              {userAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.currency} • {acc.number || `#${acc.id}`} (Баланс: {acc.balance})
                </option>
              ))}
            </select>
          </div>

          {/* Номер счета получателя */}
          <div className="space-y-1.5">
            <label htmlFor="to-account" className="nothing-form-label">Номер счета получателя</label>
            <input
              id="to-account"
              type="text"
              disabled={isLoading}
              value={toAccountNumber}
              onChange={(e) => setToAccountNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="20 цифр"
              maxLength={20}
              className="nothing-form-input pl-4! font-mono tracking-wider"
              required
            />
          </div>

          {/* Сумма */}
          <div className="space-y-1.5">
            <label htmlFor="transfer-amount" className="nothing-form-label">
              Сумма перевода {selectedAccount && `(${selectedAccount.currency})`}
            </label>
            <input
              id="transfer-amount"
              type="number"
              step="0.01"
              min="0.01"
              disabled={isLoading}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="nothing-form-input pl-4!"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || userAccounts.length === 0}
            className="w-full mt-2 py-3 px-4 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Отправка...</>
            ) : (
              <><Send className="h-3.5 w-3.5" /> Перевести</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
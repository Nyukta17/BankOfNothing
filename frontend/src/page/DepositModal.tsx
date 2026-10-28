import React, { useState, useEffect } from "react";
import { X, Loader2, Plus } from "lucide-react";
import { AccountControllerService, type AccountResponse, type TransferRequest } from "../api"; // Импортируй свой автосгенерированный тип



interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Используем живой массив счетов с бэка
    accounts: AccountResponse[];
    onDepositSubmit: (requestData: TransferRequest) => Promise<void>;
}

export default function DepositModal({ isOpen, onClose, accounts, onDepositSubmit }: DepositModalProps) {
    const [fromAccId, setFromAccId] = useState<string>("");
    const [toAccId, setToAccId] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");



    // Безопасно инициализируем селекты при открытии или изменении списка счетов
    useEffect(() => {
        if (isOpen && accounts.length > 0) {
            const firstId = accounts[0].id?.toString() || "";
            const secondId = accounts[1]?.id?.toString() || firstId;

            setToAccId(firstId);
            setFromAccId(secondId);
        }
    }, [isOpen, accounts]);

    if (!isOpen) return null;

    const handleDemoFaucet = async () => {
        if (!toAccId) {
            setError("Выберите счет для начисления");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            
            const requestData: TransferRequest = {
                fromAccountId: 0, // Условность: 0 — это системный кран банка
                toAccountId: Number(toAccId),
                amount: 50000, // Фиксированная сумма демо-пополнения
                idempotencyKey: crypto.randomUUID()
            };

            

            await onDepositSubmit(requestData);
            setAmount("");
            onClose();
        } catch (err: any) {
            setError("Ошибка начисления: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError("Введите корректную сумму пополнения");
            return;
        }

        if (!fromAccId || !toAccId) {
            setError("Выберите счета для проведения операции");
            return;
        }

        setIsLoading(true);

        try {
            const requestData: TransferRequest = {
                fromAccountId: Number(fromAccId),
                toAccountId: Number(toAccId),
                amount: numAmount,
                idempotencyKey: crypto.randomUUID()
            };

            await onDepositSubmit(requestData);

            setAmount("");
            onClose();
        } catch (err: any) {
            setError(err.message || "Ошибка при выполнении пополнения");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Задний полупрозрачный фон с размытием */}
            <div className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-xs" onClick={onClose} />

            {/* Карточка */}
            <div className="nothing-auth-card bg-slate-50 dark:bg-zinc-950 relative z-10 w-full max-w-sm m-0 animate-in fade-in zoom-in-95 duration-200">

                {/* Кнопка закрытия */}
                <button onClick={onClose} className="nothing-btn-icon absolute right-4 top-4 opacity-50 hover:opacity-100">
                    <X className="h-4 w-4" />
                </button>

                <div className="text-center">
                    <h2 className="text-xl font-extrabold tracking-tight">Пополнение счета</h2>
                    <p className="mt-1 text-xs opacity-60">Перевод между своими счетами банка</p>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 rounded-xl text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    {/* Счет списания (Откуда) */}
                    <div className="space-y-1.5">
                        <label className="nothing-form-label">Счет списания</label>
                        <select
                            disabled={isLoading}
                            value={fromAccId}
                            onChange={(e) => setFromAccId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-current/10 bg-current/5 text-sm focus:outline-none text-current cursor-pointer"
                        >
                            {accounts.map((a, idx) => (
                                <option key={`from-${a.id ?? idx}`} value={a.id} className="dark:bg-zinc-950">
                                    № {idx + 1 || "Неизвестный"} ({a.currency || "RUB"}) — {(a.balance || 0).toLocaleString()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Счет зачисления (Куда) */}
                    <div className="space-y-1.5">
                        <label className="nothing-form-label">Куда зачислить</label>
                        <select
                            disabled={isLoading}
                            value={toAccId}
                            onChange={(e) => setToAccId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-current/10 bg-current/5 text-sm focus:outline-none text-current cursor-pointer"
                        >
                            {accounts.map((a, idx) => (
                                <option key={`to-${a.id ?? idx}`} value={a.id} className="dark:bg-zinc-950">
                                    № {idx + 1 || "Неизвестный"} ({a.currency || "RUB"}) — {(a.balance || 0).toLocaleString()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Сумма */}
                    <div className="space-y-1.5">
                        <label htmlFor="deposit-amount" className="nothing-form-label">Сумма пополнения</label>
                        <input
                            id="deposit-amount"
                            type="number"
                            disabled={isLoading}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="nothing-form-input pl-4!"
                        />
                    </div>

                    {/* Кнопка отправки */}
                    <div className="pt-2 border-t border-current/10 space-y-2">
                        <p className="text-[10px] opacity-40 text-center uppercase tracking-wider font-semibold">
                            Режим отладки (Для учебного проекта)
                        </p>
                        <button
                            type="button"
                            onClick={handleDemoFaucet}
                            disabled={isLoading}
                            className="w-full py-2 px-4 text-xs font-bold rounded-xl border border-dashed border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            ➕ Зачислить тестовые 50 000 на счет {accounts.findIndex(a => a.id === Number(toAccId)) + 1}
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 py-3 px-4 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Проведение платежа...
                            </>
                        ) : (
                            <>
                                Пополнить счет
                                <Plus className="h-3.5 w-3.5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

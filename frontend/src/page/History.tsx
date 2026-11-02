import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";
import { Sun, Moon, ArrowLeft, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import { TransactionControllerService } from "../api";

type ServerTransaction = {
  id?: number;
  title?: string;
  category?: string;
  amount?: number;
  type?: "DEPOSIT" | "TRANSFER" | string;
  createdAt?: string;
};

const ITEMS_PER_PAGE = 4;

export default function History() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<ServerTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setError("");

    const token = localStorage.getItem("token") || "";
    const authHeader = `Bearer ${token}`;

    TransactionControllerService.getHistory(authHeader, 0, 100)
      .then((pageResponse) => {
        const serverList = pageResponse.content || [];
        setTransactions(Array.isArray(serverList) ? serverList : []);
      })
      .catch((err) => {
        console.error(err);
        setError("Не удалось загрузить историю операций");
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Вынесли определение дохода в чистую функцию для переиспользования
  const checkIsIncome = (tx: ServerTransaction): boolean => {
    if (!tx.amount) return false;
    // Доход, если тип DEPOSIT или если сумма положительная (для входящих TRANSFER)
    return tx.type === "DEPOSIT" || tx.amount > 0;
  };

  const filteredTx = useMemo(() => {
    return transactions.filter((tx) => {
      const titleText = tx.title || "Операция";
      const catText = tx.category || "Банк";
      
      const isIncome = checkIsIncome(tx);

      const matchesSearch =
        titleText.toLowerCase().includes(search.toLowerCase()) ||
        catText.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        filterType === "all" ||
        (filterType === "income" && isIncome) ||
        (filterType === "expense" && !isIncome);

      return matchesSearch && matchesType;
    });
  }, [transactions, search, filterType]);

  const totalPages = Math.ceil(filteredTx.length / ITEMS_PER_PAGE);

  const paginatedTx = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return filteredTx.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTx, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="nothing-page">
      <nav className="nothing-nav">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm font-medium opacity-60 hover:opacity-100 cursor-pointer group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          В личный кабинет
        </button>
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="nothing-btn-icon">
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">История операций</h1>
          <p className="text-xs opacity-50 mt-1">Полный аудит движения ваших средств</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center w-full">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
            <input
              type="text"
              disabled={isLoading}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }}
              placeholder="Поиск по названию или категории..."
              className="nothing-form-input pl-10!"
            />
          </div>

          <select
            disabled={isLoading}
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value as any); setCurrentPage(0); }}
            className="px-4 py-3 rounded-xl border border-current/10 bg-current/5 text-sm focus:outline-none text-current cursor-pointer w-full"
          >
            <option value="all" className="dark:bg-zinc-950">Все операции</option>
            <option value="income" className="dark:bg-zinc-950">Только зачисления (+)</option>
            <option value="expense" className="dark:bg-zinc-950">Только списания (-)</option>
          </select>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-2 opacity-60">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-zinc-50" />
            <span className="text-xs font-medium">Загрузка истории...</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-center">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-4">
            <div className="nothing-list-container">
              {paginatedTx.length > 0 ? (
                paginatedTx.map((tx, idx) => {
                  const isIncome = checkIsIncome(tx);
                  
                  const formattedDate = tx.createdAt
                    ? new Date(tx.createdAt).toLocaleDateString()
                    : "Не указана";

                  // Math.abs убирает минус, если бэкенд прислал отрицательное число
                  const rublesAmount = Math.abs(tx.amount || 0);

                  return (
                    <div key={tx.id ?? idx} className="nothing-list-item">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${isIncome ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-current/5 opacity-80"}`}>
                          {isIncome ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{tx.title || "Перевод"}</h4>
                          <p className="text-xs opacity-50 mt-0.5">{tx.category || "Прочее"} • {formattedDate}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${isIncome ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                        {isIncome ? "+" : "-"}{rublesAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ₽
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-center py-8 text-sm opacity-40">Операций не найдено</p>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-1 text-xs sm:text-sm">
                <span className="opacity-50">
                  Страница {currentPage + 1} из {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 0}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="nothing-btn-pill disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Назад
                  </button>
                  <button
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="nothing-btn-pill disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Вперед
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

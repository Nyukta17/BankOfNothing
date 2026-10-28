import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";
import { Sun, Moon, ArrowLeft, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight, Search } from "lucide-react";

// БОЛЬШОЙ MOCK-МАССИВ (Для демонстрации автономной пагинации)
const MOCK_ALL_TRANSACTIONS = [
  { id: "1", title: "Доставка еды", cat: "Рестораны", amt: "-1,200.00 ₽", inc: false, date: "2026-10-26" },
  { id: "2", title: "Зачисление зарплаты", cat: "Работа", amt: "+70,000.00 ₽", inc: true, date: "2026-10-25" },
  { id: "3", title: "Подписка на контент", cat: "Развлечения", amt: "-400.00 ₽", inc: false, date: "2026-10-24" },
  { id: "4", title: "Перевод от Олега", cat: "Переводы", amt: "+5,000.00 ₽", inc: true, date: "2026-10-22" },
  { id: "5", title: "Продукты супермаркет", cat: "Магазины", amt: "-3,450.00 ₽", inc: false, date: "2026-10-20" },
  { id: "6", title: "Покупка курса по Java", cat: "Обучение", amt: "-15,000.00 ₽", inc: false, date: "2026-10-18" },
  { id: "7", title: "Кэшбэк за подписки", cat: "Бонусы", amt: "+150.00 ₽", inc: true, date: "2026-10-15" },
  { id: "8", title: "Кофе на вынос", cat: "Рестораны", amt: "-250.00 ₽", inc: false, date: "2026-10-12" },
  { id: "9", title: "Аренда серверов", cat: "Технологии", amt: "-1,100.00 ₽", inc: false, date: "2026-10-10" },
  { id: "10", title: "Перевод маме", cat: "Переводы", amt: "-3,000.00 ₽", inc: false, date: "2026-10-05" }
];

const ITEMS_PER_PAGE = 4; // Количество элементов на одну страницу

export default function History() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Состояния фильтрации и пагинации
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [currentPage, setCurrentPage] = useState(0);

  // Логика фильтрации транзакций на клиенте
  const filteredTx = useMemo(() => {
    return MOCK_ALL_TRANSACTIONS.filter((tx) => {
      const matchesSearch = tx.title.toLowerCase().includes(search.toLowerCase()) || tx.cat.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === "all" || (filterType === "income" && tx.inc) || (filterType === "expense" && !tx.inc);
      return matchesSearch && matchesType;
    });
  }, [search, filterType]);

  // Расчет страниц
  const totalPages = Math.ceil(filteredTx.length / ITEMS_PER_PAGE);
  
  const paginatedTx = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return filteredTx.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTx, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // TODO: API_INTEGRATION: [GET /api/v1/transactions?page=${newPage}&size=${ITEMS_PER_PAGE}&type=${filterType}&search=${search} — получение порции данных через Spring Data Pageable]
  };

  return (
    <div className="nothing-page">
      
      {/* ШАПКА */}
      <nav className="nothing-nav">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm font-medium opacity-60 hover:opacity-100 cursor-pointer group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          В личный кабинет
        </button>
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="nothing-btn-icon">
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </nav>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">История операций</h1>
          <p className="text-xs opacity-50 mt-1">Полный аудит движения ваших средств</p>
        </div>

        {/* ПАНЕЛЬ ФИЛЬТРОВ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center w-full">
          {/* Поисковый инпут */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }}
              placeholder="Поиск по названию или категории..."
              className="nothing-form-input pl-10!"
            />
          </div>

          {/* Фильтр типа операций */}
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value as any); setCurrentPage(0); }}
            className="px-4 py-3 rounded-xl border border-current/10 bg-current/5 text-sm focus:outline-none text-current cursor-pointer w-full"
          >
            <option value="all" className="dark:bg-zinc-950">Все операции</option>
            <option value="income" className="dark:bg-zinc-950">Только зачисления (+)</option>
            <option value="expense" className="dark:bg-zinc-950">Only списания (-)</option>
          </select>
        </div>

        {/* СПИСОК ТРАНЗАКЦИЙ С ПАГИНАЦИЕЙ */}
        <div className="space-y-4">
          <div className="nothing-list-container">
            {paginatedTx.length > 0 ? (
              paginatedTx.map((tx) => (
                <div key={tx.id} className="nothing-list-item">
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
              ))
            ) : (
              <p className="text-center py-8 text-sm opacity-40">Операций не найдено</p>
            )}
          </div>

          {/* ЭЛЕМЕНТЫ УПРАВЛЕНИЯ ПАГИНАЦИЕЙ */}
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
      </main>
    </div>
  );
}

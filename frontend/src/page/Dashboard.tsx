import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";
import { Sun, Moon, LogOut, Plus, Send, DollarSign, TrendingUp, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { AccountControllerService, AuthControllerService, OpenAPI, type AccountResponse } from "../api";
import CreateAccountModal from "./CreateAccountModal";
import DepositModal from "./DepositModal";

// MOCK DATA (Автономная работа)
const MOCK_USER = { name: "Максим И.", total: "1,240,500.00 ₽" };
const MOCK_TX = [
  { id: "1", title: "Доставка еды", cat: "Рестораны", amt: "-1,200.00 ₽", date: "Сегодня", inc: false },
  { id: "2", title: "Зачисление зарплаты", cat: "Работа", amt: "+70,000.00 ₽", date: "Вчера", inc: true },
  { id: "3", title: "Перевод от Олега", cat: "Переводы", amt: "+5,000.00 ₽", date: "22 Окт", inc: true }
];

export default function Dashboard() {

  const [accounts, setAccount] = useState<AccountResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const [selectedCurrencyIndex, setSelectedCurrencyIndex] = useState(0);



  useEffect(() => {

    setIsLoading(true);
    setError("")
    AccountControllerService.getAll()
      .then((date) => { setAccount(date); })
      .catch((err) => { setError(err.message || "Не удалось загрузить данные") })
      .finally(() => { setIsLoading(false) })

  }, [])
  // Группировка и подсчет баланса отдельно для каждой валюты
  const balancesByCurrency = useMemo(() => {
    if (!accounts || accounts.length === 0) return [];

    // Собираем суммы по ключу валюты: { RUB: 100, USD: 50 }
    const grouped = accounts.reduce((acc, account) => {
      const cur = (account.currency || "RUB").toUpperCase();
      acc[cur] = (acc[cur] || 0) + (account.balance || 0);
      return acc;
    }, {} as Record<string, number>);

    // Превращаем объект в массив для удобного рендеринга
    return Object.entries(grouped).map(([currency, total]) => ({
      currency,
      displayTotal: `${total.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency === "RUB" ? "₽" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency
        }`
    }));
  }, [accounts]);
  const handleDepositSubmit = async () => {}


  const handleAction = (act: string) => {
    switch (act) {
      case "Новый счет":
      case "Создать счет":
        setIsModalOpen(true);
        break;

      case "Пополнить":
        setIsDepositOpen(true);
        break;
      case "Перевести":
        navigate("/transfer");
        break;

      case "Обмен":
        navigate("/exchange");
        break;

      case "Анализ":
        navigate("/analytics");
        break;

      default:
        alert(`Операция: ${act}`);
    }
  };
  const logout = () => {
    AuthControllerService.logout()
      .catch((err) => { console.error("ошибка при logout:", err) })
      .finally(() => {
        localStorage.removeItem("token")
        OpenAPI.TOKEN = ""
        navigate("/")
      })
  }
  if (isLoading) {
    return (
      <div className="nothing-page flex flex-col items-center justify-center gap-3">
        {/* Анимированный спиннер, который крутится */}
        <Loader2 className="h-6 w-6 text-blue-600 dark:text-zinc-400 animate-spin" />
        <p className="text-xs font-medium opacity-50 tracking-wider uppercase">
          Получение данных...
        </p>
      </div>
    );
  }
  return (
    <div className="nothing-page">

      {/* ВЕРХНЯЯ ПАНЕЛЬ */}
      <nav className="nothing-nav">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="h-5 w-5 rounded bg-blue-600 dark:bg-zinc-50" />
          <span className="font-bold text-sm tracking-tight">BankOfNothing</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="opacity-65 mr-2 hidden sm:inline">{MOCK_USER.name}</span>
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="nothing-btn-icon">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <button onClick={logout} className="nothing-btn-icon text-red-500 hover:bg-red-500/10">
            {/* TODO: API_INTEGRATION: [POST /api/v1/auth/logout] */}
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* ОСНОВНОЙ БЛОК */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="mb-8">
          <p className="text-xs font-semibold opacity-50 tracking-wider uppercase mb-1">Общий баланс</p>

          {/* Отображаем только ОДНУ выбранную сумму крупно */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight h-[40px] sm:h-[60px] flex items-center">
            {balancesByCurrency[selectedCurrencyIndex]?.displayTotal || "0.00"}
          </h1>

          {/* Segmented Control для переключения валют (показывается, только если валют > 1) */}
          {balancesByCurrency.length > 1 && (
            <div className="mt-4 inline-flex p-1 bg-current/5 border border-current/10 rounded-xl max-w-full overflow-x-auto">
              {balancesByCurrency.map((item, index) => (
                <button
                  key={item.currency}
                  type="button"
                  onClick={() => setSelectedCurrencyIndex(index)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${selectedCurrencyIndex === index
                    ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-white"
                    : "opacity-60 hover:opacity-100"
                    }`}
                >
                  {item.currency}
                </button>
              ))}
            </div>
          )}
        </div>




        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">

          {/* КОЛОНКА СЧЕТОВ */}
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold">Ваши счета</h2>
              <button onClick={() => handleAction("Новый счет")} className="nothing-btn-pill">
                <Plus className="h-3 w-3" /> Новый
              </button>
            </div>

            {/* КРИТИЧЕСКИЙ КУСОЧЕК: Проверяем, есть ли счета */}
            {accounts.length === 0 ? (
              /* Если счетов нет — показываем стильный Empty State */
              <div className="p-6 rounded-2xl border border-current/10 border-dashed flex flex-col items-center justify-center text-center h-36 w-full space-y-3">
                <p className="text-xs opacity-50 font-medium">У вас пока нет открытых счетов</p>
                <button
                  onClick={() => handleAction("Новый счет")}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl text-white bg-blue-600 dark:bg-zinc-50 dark:text-black hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Открыть первый счет
                </button>
              </div>
            ) : (
              /* Если счета есть — запускаем наш стандартный перебор массивов */
              accounts.map((acc) => (
                <div key={acc.id} className="nothing-card">
                  <div className="flex justify-between items-start w-full">
                    <div>
                      {/* Отображаем трехбуквенный код валюты (например, RUB, USD) */}
                      <h3 className="font-bold text-sm tracking-wider uppercase">
                        Счет {acc.currency || "RUB"}
                      </h3>
                      {/* Отображаем статус счета (например, ACTIVE, BLOCKED) */}
                      <p className="text-[10px] uppercase tracking-wide opacity-50 mt-0.5">
                        Статус: {acc.status || "ACTIVE"}
                      </p>
                    </div>

                    {/* В правом углу оставляем аккуратную плашку с ID или валютой */}
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-current/10 font-medium opacity-60">
                      #{acc.id?.toString().slice(0, 4) || "0000"}
                    </span>
                  </div>

                  {/* Основной баланс: форматируем число и подставляем символ или код валюты */}
                  <p className="text-xl font-extrabold tracking-tight">
                    {acc.balance !== undefined ? acc.balance.toLocaleString() : "0.00"}{" "}
                    {acc.currency === "RUB" ? "₽" : acc.currency === "USD" ? "$" : acc.currency || "₽"}
                  </p>
                </div>
              ))
            )}
          </div>


          {/* КОЛОНКА ОПЕРАЦИЙ И АКТИВНОСТИ */}
          <div className="lg:col-span-2 space-y-6 w-full">

            {/* БЫСТРЫЕ ДЕЙСТВИЯ */}
            <div className="nothing-list-container grid grid-cols-2 sm:grid-cols-4 gap-3 p-6!">
              {[
                { name: "Перевести", icon: Send, color: "text-blue-600 dark:text-blue-400" },
                { name: "Пополнить", icon: Plus, color: "text-emerald-600 dark:text-emerald-400" },
                { name: "Обмен", icon: DollarSign, color: "text-indigo-600 dark:text-indigo-400" },
                { name: "Анализ", icon: TrendingUp, color: "text-purple-600 dark:text-purple-400" }
              ].map((btn) => (
                <button key={btn.name} onClick={() => handleAction(btn.name)} className="nothing-btn-action">
                  <btn.icon className={`h-4 w-4 ${btn.color}`} />
                  <span>{btn.name}</span>
                </button>
              ))}
            </div>

            {/* СПИСОК ТРАНЗАКЦИЙ */}
            <div className="space-y-3 w-full">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-base font-bold">Последняя активность</h2>
                <span onClick={() => navigate("/history")} className="text-xs text-blue-600 dark:text-zinc-400 hover:underline cursor-pointer">Смотреть все</span>
                {/* TODO: API_INTEGRATION: [GET /api/v1/transactions с Pageable] */}
              </div>

              <div className="nothing-list-container">
                {MOCK_TX.map((tx) => (
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
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
      <CreateAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // TODO: API_INTEGRATION: [Вызов функции fetchAccounts() для повторного получения актуального списка счетов с бэкенда]
          console.log("Список счетов обновлен");
        }}
      />
      
      {isDepositOpen && <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        accounts={accounts} // Передаем живой массив счетов с бэка
        onDepositSubmit={handleDepositSubmit}
      />}


    </div>
  );
}

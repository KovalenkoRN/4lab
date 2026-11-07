import { useState } from "react";
import "./DiscountCalculator.css";

// Справочник категорий: discount хранится в процентах
const CATEGORIES = [
  { id: "electronics", label: "Электроника", discount: 5 },
  { id: "clothing", label: "Одежда", discount: 15 },
  { id: "groceries", label: "Продукты", discount: 10 },
  { id: "books", label: "Книги", discount: 20 },
  { id: "other", label: "Другое", discount: 0 },
];

// Ставка НДС в долях (22%)
const VAT_RATE = 0.22;

// Промокоды: код -> дополнительная скидка в процентах (задание 2)
const PROMO_CODES = { WELCOME10: 10 };

// Сколько расчётов хранить в истории (задание 5)
const HISTORY_SIZE = 5;

// Счётчик для уникальных id товаров (нужен для key в списке)
let nextId = 1;
function createItem() {
  return { id: nextId++, price: "", category: "electronics", error: "" };
}

function formatRub(value) {
  return value.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function DiscountCalculator() {
  // --- Состояние ---
  // Задание 1: список товаров (массив), у каждого своя цена и категория
  const [items, setItems] = useState(() => [createItem()]);
  // Задание 2: промокод
  const [promo, setPromo] = useState("");
  // Задание 3: ручная скидка ползунком, заменяет скидку категории
  const [useCustomDiscount, setUseCustomDiscount] = useState(false);
  const [customDiscount, setCustomDiscount] = useState(10);
  // Задание 4: переключатель НДС
  const [withVat, setWithVat] = useState(true);
  // Задание 5: история расчётов
  const [history, setHistory] = useState([]);

  // Признак того, что пользователь нажал «Рассчитать»
  const [calculated, setCalculated] = useState(false);

  // --- Обработчики событий ---

  // Изменение поля конкретного товара (цена или категория)
  function handleItemChange(id, field, value) {
    // Для цены разрешаем только цифры и одну точку
    if (field === "price" && !(value === "" || /^\d*\.?\d*$/.test(value))) {
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value, error: field === "price" ? "" : item.error } : item
      )
    );
    setCalculated(false); // Данные изменились — результаты устарели
  }

  function handleAddItem() {
    setItems((prev) => [...prev, createItem()]);
    setCalculated(false);
  }

  function handleRemoveItem(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setCalculated(false);
  }

  function handlePromoChange(e) {
    setPromo(e.target.value);
    setCalculated(false);
  }

  function handleCustomToggle(e) {
    setUseCustomDiscount(e.target.checked);
    setCalculated(false);
  }

  function handleCustomDiscountChange(e) {
    setCustomDiscount(Number(e.target.value));
    setCalculated(false);
  }

  function handleVatToggle(e) {
    setWithVat(e.target.checked);
    setCalculated(false);
  }

  // Проверка цены одного товара: возвращает текст ошибки или ""
  function validatePrice(price) {
    if (!price.trim()) return "Введите цену товара";
    const num = parseFloat(price);
    if (isNaN(num) || num <= 0) return "Цена должна быть положительным числом";
    return "";
  }

  // --- Вычисления ---
  const promoCode = promo.trim().toUpperCase();
  const promoPercent = PROMO_CODES[promoCode] || 0;
  const promoUnknown = promoCode !== "" && promoPercent === 0;

  // Расчёт по каждой позиции
  const rows = items.map((item) => {
    const category = CATEGORIES.find((c) => c.id === item.category);
    const price = parseFloat(item.price) || 0;
    // Ползунок заменяет скидку категории
    const discountPercent = useCustomDiscount ? customDiscount : category.discount;
    const discountAmount = price * (discountPercent / 100);
    const afterDiscount = price - discountAmount;
    // Промокод — ещё 10% поверх: от цены, уже уменьшенной на скидку категории
    const promoAmount = afterDiscount * (promoPercent / 100);
    const afterPromo = afterDiscount - promoAmount;
    return { ...item, category, price, discountPercent, discountAmount, promoAmount, afterPromo };
  });

  const sum = (key) => rows.reduce((acc, r) => acc + r[key], 0);
  const totalPrice = sum("price");
  const totalDiscount = sum("discountAmount");
  const totalPromo = sum("promoAmount");
  const totalAfterDiscounts = sum("afterPromo");
  const vatAmount = withVat ? totalAfterDiscounts * VAT_RATE : 0;
  const total = totalAfterDiscounts + vatAmount;

  // Нажатие кнопки «Рассчитать»
  function handleCalculate() {
    // Валидируем все позиции сразу
    const checked = items.map((item) => ({ ...item, error: validatePrice(item.price) }));
    setItems(checked);

    if (checked.some((item) => item.error)) {
      setCalculated(false);
      return;
    }

    setCalculated(true);

    // Добавляем запись в историю (новые сверху, не больше 5)
    const entry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      count: items.length,
      discount: useCustomDiscount ? `ручная ${customDiscount}%` : "по категориям",
      promo: promoPercent ? promoCode : null,
      withVat,
      total,
    };
    setHistory((prev) => [entry, ...prev].slice(0, HISTORY_SIZE));
  }

  // Сброс формы (история расчётов сохраняется)
  function handleReset() {
    setItems([createItem()]);
    setPromo("");
    setUseCustomDiscount(false);
    setCustomDiscount(10);
    setWithVat(true);
    setCalculated(false);
  }

  // --- Разметка ---
  return (
    <div className="calculator-wrapper">
      <h2 className="calculator-title">Калькулятор скидок</h2>

      {/* Задание 1: список товаров */}
      <div className="items">
        {items.map((item, index) => (
          <div className="item" key={item.id}>
            <div className="item_header">
              <span className="item_title">Товар {index + 1}</span>
              {items.length > 1 && (
                <button
                  type="button"
                  className="item_remove"
                  onClick={() => handleRemoveItem(item.id)}
                  aria-label={`Удалить товар ${index + 1}`}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="field">
              <label htmlFor={`price-${item.id}`} className="field_label">
                Цена товара (₽)
              </label>
              <input
                id={`price-${item.id}`}
                type="text"
                className={`field_input ${item.error ? "field_input--error" : ""}`}
                value={item.price}
                onChange={(e) => handleItemChange(item.id, "price", e.target.value)}
                placeholder="Например: 1000"
                inputMode="decimal"
              />
              {item.error && <span className="field_error">{item.error}</span>}
            </div>

            <div className="field field--last">
              <label htmlFor={`category-${item.id}`} className="field_label">
                Категория товара
              </label>
              <select
                id={`category-${item.id}`}
                className="field_input field_select"
                value={item.category}
                onChange={(e) => handleItemChange(item.id, "category", e.target.value)}
                disabled={useCustomDiscount}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label} — скидка {cat.discount}%
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn--add" onClick={handleAddItem}>
        + Добавить товар
      </button>

      {/* Задание 2: промокод */}
      <div className="field">
        <label htmlFor="promo" className="field_label">
          Промокод
        </label>
        <input
          id="promo"
          type="text"
          className={`field_input ${promoUnknown ? "field_input--error" : ""} ${promoPercent ? "field_input--ok" : ""}`}
          value={promo}
          onChange={handlePromoChange}
          placeholder="Например: WELCOME10"
        />
        {promoPercent > 0 && <span className="field_hint">Промокод применён: −{promoPercent}% поверх скидки</span>}
        {promoUnknown && <span className="field_error">Такого промокода нет</span>}
      </div>

      {/* Задание 3: ручная скидка ползунком */}
      <div className="field">
        <label className="switch">
          <input type="checkbox" checked={useCustomDiscount} onChange={handleCustomToggle} />
          Своя скидка вместо скидки категории
        </label>
        {useCustomDiscount && (
          <div className="range">
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={customDiscount}
              onChange={handleCustomDiscountChange}
              aria-label="Размер скидки"
            />
            <span className="range_value">{customDiscount}%</span>
          </div>
        )}
      </div>

      {/* Задание 4: переключатель НДС */}
      <div className="field">
        <label className="switch">
          <input type="checkbox" checked={withVat} onChange={handleVatToggle} />
          Начислять НДС (22%)
        </label>
      </div>

      {/* Кнопки */}
      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={handleCalculate}>
          Рассчитать
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleReset}>
          Сбросить
        </button>
      </div>

      {/* Результаты — показываем только после расчёта */}
      {calculated && (
        <div className="results">
          <h3 className="results_title">Результат расчёта</h3>

          {/* Расчёт по каждой позиции */}
          <table className="results_table results_table--items">
            <thead>
              <tr>
                <th>Позиция</th>
                <th>Цена</th>
                <th>Скидка</th>
                <th>После скидок</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, index) => (
                <tr key={r.id}>
                  <td>
                    {index + 1}. {r.category.label}
                  </td>
                  <td className="results_value">{formatRub(r.price)}</td>
                  <td className="results_value results_value--discount">
                    {r.discountPercent}%{promoPercent ? ` + ${promoPercent}%` : ""}
                  </td>
                  <td className="results_value">{formatRub(r.afterPromo)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Итоги по всем позициям */}
          <table className="results_table">
            <tbody>
              <tr>
                <td>Исходная сумма ({items.length} шт.)</td>
                <td className="results_value">{formatRub(totalPrice)} ₽</td>
              </tr>
              <tr>
                <td>Скидка ({useCustomDiscount ? `ручная ${customDiscount}%` : "по категориям"})</td>
                <td className="results_value results_value--discount">−{formatRub(totalDiscount)} ₽</td>
              </tr>
              {promoPercent > 0 && (
                <tr>
                  <td>
                    Промокод {promoCode} (−{promoPercent}%)
                  </td>
                  <td className="results_value results_value--discount">−{formatRub(totalPromo)} ₽</td>
                </tr>
              )}
              <tr>
                <td>Цена после скидок</td>
                <td className="results_value">{formatRub(totalAfterDiscounts)} ₽</td>
              </tr>
              <tr>
                <td>{withVat ? "НДС (22%)" : "НДС"}</td>
                <td className="results_value">{withVat ? `+${formatRub(vatAmount)} ₽` : "не начисляется"}</td>
              </tr>
              <tr className="results_row--total">
                <td>Итого к оплате</td>
                <td className="results_value">{formatRub(total)} ₽</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Задание 5: история последних 5 расчётов */}
      {history.length > 0 && (
        <div className="history">
          <div className="history_header">
            <h3 className="results_title">История расчётов</h3>
            <button type="button" className="history_clear" onClick={() => setHistory([])}>
              очистить
            </button>
          </div>
          <ol className="history_list">
            {history.map((h) => (
              <li key={h.id} className="history_item">
                <span className="history_meta">
                  {h.time} · {h.count} шт. · скидка {h.discount}
                  {h.promo ? ` · ${h.promo}` : ""} · {h.withVat ? "с НДС" : "без НДС"}
                </span>
                <span className="history_total">{formatRub(h.total)} ₽</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default DiscountCalculator;

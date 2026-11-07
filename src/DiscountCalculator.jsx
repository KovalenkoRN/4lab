import { useState } from "react";
import "./DiscountCalculator.css";

const CATEGORIES = [
  { id: "electronics", label: "Электроника", discount: 5 },
  { id: "clothing", label: "Одежда", discount: 15 },
  { id: "groceries", label: "Продукты", discount: 10 },
  { id: "books", label: "Книги", discount: 20 },
  { id: "other", label: "Другое", discount: 0 },
];

const VAT_RATE = 0.22;

function DiscountCalculator() {
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("electronics");
  const [calculated, setCalculated] = useState(false);
  const [error, setError] = useState("");

  function handlePriceChange(e) {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPrice(value);
      setError("");
      setCalculated(false);
    }
  }

  function handleCategoryChange(e) {
    setCategory(e.target.value);
    setCalculated(false);
  }

  function handleCalculate() {
    const numPrice = parseFloat(price);
    if (!price.trim()) {
      setError("Введите цену товара");
      setCalculated(false);
      return;
    }
    if (isNaN(numPrice) || numPrice <= 0) {
      setError("Цена должна быть положительным числом");
      setCalculated(false);
      return;
    }
    setError("");
    setCalculated(true);
  }

  function handleReset() {
    setPrice("");
    setCategory("electronics");
    setCalculated(false);
    setError("");
  }

  const selectedCategory = CATEGORIES.find((c) => c.id === category);
  const numPrice = parseFloat(price) || 0;
  const discountPercent = selectedCategory ? selectedCategory.discount : 0;
  const discountAmount = calculated ? numPrice * (discountPercent / 100) : 0;
  const priceAfterDiscount = calculated ? numPrice - discountAmount : 0;
  const vatAmount = calculated ? priceAfterDiscount * VAT_RATE : 0;
  const total = calculated ? priceAfterDiscount + vatAmount : 0;

  function formatRub(value) {
    return value.toLocaleString("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <div className="calculator-wrapper">
      <h2 className="calculator-title">Калькулятор скидок</h2>

      <div className="field">
        <label htmlFor="price" className="field_label">Цена товара (Р)</label>
        <input
          id="price"
          type="text"
          className={`field_input ${error ? "field_input--error" : ""}`}
          value={price}
          onChange={handlePriceChange}
          placeholder="Например: 1000"
          inputMode="decimal"
        />
        {error && <span className="field_error">{error}</span>}
      </div>

      <div className="field">
        <label htmlFor="category" className="field_label">Категория товара</label>
        <select
          id="category"
          className="field_input field_select"
          value={category}
          onChange={handleCategoryChange}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label} — скидка {cat.discount}%
            </option>
          ))}
        </select>
      </div>

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={handleCalculate}>
          Рассчитать
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleReset}>
          Сбросить
        </button>
      </div>

      {calculated && !error && (
        <div className="results">
          <h3 className="results_title">Результат расчёта</h3>
          <table className="results_table">
            <tbody>
              <tr>
                <td>Исходная цена</td>
                <td className="results_value">{formatRub(numPrice)} Р</td>
              </tr>
              <tr>
                <td>Скидка ({discountPercent}%, категория «{selectedCategory?.label}»)</td>
                <td className="results_value results_value--discount">
                  −{formatRub(discountAmount)} Р
                </td>
              </tr>
              <tr>
                <td>Цена после скидки</td>
                <td className="results_value">{formatRub(priceAfterDiscount)} Р</td>
              </tr>
              <tr>
                <td>НДС (22%)</td>
                <td className="results_value">+{formatRub(vatAmount)} Р</td>
              </tr>
              <tr className="results_row--total">
                <td>Итого к оплате</td>
                <td className="results_value">{formatRub(total)} Р</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DiscountCalculator;
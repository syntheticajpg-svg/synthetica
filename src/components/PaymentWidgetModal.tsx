import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LegalModal from './LegalModal';

interface PaymentWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultItemName?: string;
  defaultPrice?: number;
  language: 'RU' | 'EN';
  isCustomWidget?: boolean;
  showTg?: boolean;
  showEmailText?: boolean;
}

export default function PaymentWidgetModal({ isOpen, onClose, defaultItemName, defaultPrice, language, isCustomWidget, showTg, showEmailText }: PaymentWidgetModalProps) {
  const [usdtRate, setUsdtRate] = useState(93);
  const [price, setPrice] = useState<number>(defaultPrice || 6300);
  const [itemName, setItemName] = useState<string>(defaultItemName || 'Мини-курс Pinterest Pin & Profit');
  const [customAmount, setCustomAmount] = useState(1000);
  const [useCustomAmount, setUseCustomAmount] = useState(false);

  // User details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tg, setTg] = useState('');
  const [promo, setPromo] = useState('');

  const [mainMethod, setMainMethod] = useState<'fiat' | 'crypto'>('fiat');
  const [ymSubMethod, setYmSubMethod] = useState<'AC' | 'PC'>('AC');

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errors, setErrors] = useState<{name?: boolean, email?: boolean, tg?: boolean}>({});

  const [legalModal, setLegalModal] = useState<{isOpen: boolean, type: 'offer' | 'privacy' | 'consent'}>({
    isOpen: false,
    type: 'offer'
  });

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(data => {
        if (data?.rates?.RUB) {
          setUsdtRate(Math.floor(data.rates.RUB) + 3);
        }
      })
      .catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (defaultPrice) setPrice(defaultPrice);
    if (defaultItemName) setItemName(defaultItemName);
  }, [defaultPrice, defaultItemName, isOpen]);

  // Support link builder
  const supportLink = `https://mail.google.com/mail/?view=cm&fs=1&to=synthetica.jpg@gmail.com&su=${encodeURIComponent('Проблема с оплатой на сайте')}&body=${encodeURIComponent(`Здравствуйте! У меня возникла проблема с оплатой.\n\nМои данные:\nИмя: ${name || 'Не указан'}\nEmail: ${email || 'Не указан'}\nTelegram: ${tg || 'Не указан'}\n\nСуть проблемы: `)}`;

  const currentSum = useCustomAmount ? customAmount : price;

  const validate = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const newErrors = {
      name: !name,
      email: !email || !emailRegex.test(email),
      tg: showTg === false ? false : !tg
    };
    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.tg;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCryptoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setShowErrorModal(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await fetch('/api/crm/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, tg, promo, itemName, currentSum, method: 'crypto',
          isCustomWidget
        })
      });
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);

    const usdtAmount = Math.ceil(currentSum / usdtRate);
    const promoText = promo ? `\nПромокод: ${promo}` : "";
    const text = `Здравствуйте! Я оплатил(а) обучение криптовалютой.\n\nПрограмма: ${itemName}\nИмя: ${name}\nEmail: ${email}\nTelegram: ${tg}${promoText}\n\nСумма перевода: ${usdtAmount} USDT.\nКвитанцию (скриншот) прикрепляю ниже ⬇️`;
    window.open(`https://t.me/syntheticajpg?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleFiatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setShowErrorModal(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await fetch('/api/crm/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, tg, promo, itemName, currentSum, method: 'fiat', ymSubMethod,
          isCustomWidget
        })
      });
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);

    // Form will proceed via standard HTML form submission to yoomoney
    (e.target as HTMLFormElement).submit();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto hidden-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-900 transition-colors bg-neutral-100/50 hover:bg-neutral-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <h2 className="text-xl font-bold text-center text-neutral-900 mb-6 tracking-tight">
            Оформление заказа
          </h2>

          <form 
            method="POST" 
            action="https://yoomoney.ru/quickpay/confirm.xml" 
            onSubmit={mainMethod === 'crypto' ? handleCryptoSubmit : handleFiatSubmit}
            noValidate
          >
            {/* Yoomoney hidden inputs */}
            <input type="hidden" name="receiver" value="4100112480943161" />
            <input type="hidden" name="quickpay-form" value="shop" />
            <input type="hidden" name="targets" value={`Оплата: ${itemName} | От: ${name}${promo ? ' | Промокод: ' + promo : ''}`} />
            <input type="hidden" name="paymentType" value={ymSubMethod} />
            <input type="hidden" name="sum" value={currentSum} data-type="number" />
            <input type="hidden" name="successURL" value={window.location.href} />

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Контактные данные:</label>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Ваше имя" 
                    value={name}
                    onChange={e => { setName(e.target.value); setErrors(p => ({...p, name: false})) }}
                    className={`w-full px-4 py-3 bg-neutral-50 border rounded-xl text-sm outline-none transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'}`}
                  />
                  <input 
                    type="email" 
                    placeholder={isCustomWidget ? "Email" : "Email для доступа"}
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: false})) }}
                    className={`w-full px-4 py-3 bg-neutral-50 border rounded-xl text-sm outline-none transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'}`}
                  />
                  {showTg !== false && (
                    <input 
                      type="text" 
                      placeholder="Ник в Telegram (@username)" 
                      value={tg}
                      onChange={e => { setTg(e.target.value); setErrors(p => ({...p, tg: false})) }}
                      className={`w-full px-4 py-3 bg-neutral-50 border rounded-xl text-sm outline-none transition-all ${errors.tg ? 'border-red-400 bg-red-50' : 'border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'}`}
                    />
                  )}
                </div>
                {showEmailText !== false && (
                  <div className="mt-3 px-3 py-2 bg-emerald-50 text-emerald-700 text-[10px] rounded-lg text-center leading-relaxed font-medium">
                    {language === 'RU' 
                      ? 'Данные для входа в зону обучения будут отправлены на почту куратором после открытия вашего личного кабинета.' 
                      : 'Login credentials for the training area will be sent to your email by a curator after your account is activated.'}
                  </div>
                )}
              </div>

              {!defaultItemName && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Выберите для оплаты:</label>
                  <select 
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none cursor-pointer focus:border-neutral-900"
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setUseCustomAmount(true);
                        setItemName('Свободная сумма');
                      } else {
                        setUseCustomAmount(false);
                        const v = Number(e.target.value);
                        setPrice(v);
                        setItemName(e.target.options[e.target.selectedIndex].text);
                      }
                    }}
                  >
                    <option value="6300">1. Мини-курс Pinterest Pin & Profit</option>
                    <option value="7500">2. Мини-курс AI-модели You're NOT perfect</option>
                    <option value="25000">3. Курс по нейросъемкам Fake It. Shake it.</option>
                    <option value="30000">4. Индивидуальное наставничество (1 мес)</option>
                    <option value="custom">5. Ввести другую сумму</option>
                  </select>
                </div>
              )}

              {useCustomAmount && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Введите сумму (₽):</label>
                  <input 
                    type="number" 
                    min="10"
                    value={customAmount}
                    onChange={e => setCustomAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none"
                  />
                </div>
              )}

              {defaultItemName && (
                <div>
                  <div className="text-sm font-medium text-neutral-700 mb-1">Товар к оплате:</div>
                  <div className="px-4 py-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm text-indigo-900 font-medium">
                    {itemName}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Промокод (если есть):</label>
                <input 
                  type="text" 
                  placeholder="Введите промокод" 
                  value={promo}
                  onChange={e => setPromo(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div className="py-4 border-y border-dashed border-neutral-200 text-center mb-6">
              <span className="text-sm text-neutral-500 mr-2">Итого:</span>
              <span className="text-2xl font-black text-neutral-900">
                {mainMethod === 'crypto' ? Math.ceil(currentSum / usdtRate) : currentSum.toLocaleString('ru-RU')}
              </span>
              <span className="text-2xl font-black text-neutral-900 ml-1">
                {mainMethod === 'crypto' ? 'USDT' : '₽'}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <label className="block text-sm font-medium text-neutral-700">Выберите способ оплаты:</label>
              
              <div className="space-y-2">
                <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${mainMethod === 'fiat' ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                  <input type="radio" name="main_method" value="fiat" checked={mainMethod === 'fiat'} onChange={() => setMainMethod('fiat')} className="mr-3 w-4 h-4 accent-neutral-900" />
                  <span className={`text-sm ${mainMethod === 'fiat' ? 'font-bold' : 'font-medium'} text-neutral-800`}>🇷🇺 Картой РФ, СБП или ЮMoney</span>
                </label>
                
                {mainMethod === 'fiat' && (
                  <div className="pl-8 py-2 space-y-3 border-l-2 border-neutral-100 ml-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="ym_sub" value="AC" checked={ymSubMethod === 'AC'} onChange={() => setYmSubMethod('AC')} className="mr-3 w-4 h-4 accent-neutral-900" />
                      <span className="text-sm text-neutral-600">Банковской картой или СБП</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="ym_sub" value="PC" checked={ymSubMethod === 'PC'} onChange={() => setYmSubMethod('PC')} className="mr-3 w-4 h-4 accent-neutral-900" />
                      <span className="text-sm text-neutral-600">Кошельком ЮMoney</span>
                    </label>
                  </div>
                )}

                <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${mainMethod === 'crypto' ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                  <input type="radio" name="main_method" value="crypto" checked={mainMethod === 'crypto'} onChange={() => setMainMethod('crypto')} className="mr-3 w-4 h-4 accent-neutral-900" />
                  <span className={`text-sm ${mainMethod === 'crypto' ? 'font-bold' : 'font-medium'} text-neutral-800`}>🪙 Криптовалюта (USDT Bybit)</span>
                </label>
              </div>

              {mainMethod === 'crypto' && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center animate-fade-in uppercase">
                  <p className="text-xs text-emerald-800 font-bold mb-2">Переведите <b>{Math.ceil(currentSum / usdtRate)} USDT</b> (сеть TRC20) на адрес:</p>
                  <div className="bg-white border border-emerald-300 p-2 text-xs font-mono rounded-lg break-all mx-auto select-all text-neutral-900 tracking-wider">
                    TWBK3b4vPeAiXLycsEjtP2mpbXVy7xfT65
                  </div>
                  <p className="text-[10px] text-emerald-600 mt-2 font-mono">Текущий курс: 1 USDT ≈ {usdtRate} ₽</p>
                  <p className="text-[10px] text-emerald-600 mt-1 font-mono">После перевода нажмите кнопку ниже для отправки квитанции.</p>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98]"
            >
              {mainMethod === 'crypto' ? 'Я перевел(а) — Отправить квитанцию' : 'Оплатить'}
            </button>

            <div className="mt-4 text-[10px] text-neutral-400 leading-relaxed text-center px-2">
              {language === 'RU' ? (
                <>
                  Нажимая на кнопку, вы принимаете условия{' '}
                  <button 
                    type="button"
                    onClick={() => setLegalModal({ isOpen: true, type: 'offer' })}
                    className="text-neutral-500 underline hover:text-neutral-900"
                  >
                    Публичной оферты
                  </button>
                  {' '}и даете{' '}
                  <button 
                    type="button"
                    onClick={() => setLegalModal({ isOpen: true, type: 'consent' })}
                    className="text-neutral-500 underline hover:text-neutral-900"
                  >
                    согласие на обработку персональных данных
                  </button>
                  {' '}в соответствии с{' '}
                  <button 
                    type="button"
                    onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })}
                    className="text-neutral-500 underline hover:text-neutral-900"
                  >
                    Политикой конфиденциальности
                  </button>
                </>
              ) : (
                <>
                  By clicking the button, you accept the terms of the{' '}
                  <button 
                    type="button"
                    onClick={() => setLegalModal({ isOpen: true, type: 'offer' })}
                    className="text-neutral-500 underline hover:text-neutral-900"
                  >
                    Public Offer
                  </button>
                  {' '}and{' '}
                  <button 
                    type="button"
                    onClick={() => setLegalModal({ isOpen: true, type: 'consent' })}
                    className="text-neutral-500 underline hover:text-neutral-900"
                  >
                    consent to the processing of personal data
                  </button>
                  {' '}in accordance with the{' '}
                  <button 
                    type="button"
                    onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })}
                    className="text-neutral-500 underline hover:text-neutral-900"
                  >
                    Privacy Policy
                  </button>
                </>
              )}
            </div>
            
            <a 
              href={supportLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-center mt-6 text-xs text-neutral-400 hover:text-neutral-600 underline"
            >
              Возникли проблемы при оплате? Свяжитесь с нами
            </a>
          </form>
        </div>
      </div>

      {showErrorModal && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-11/12 text-center shadow-2xl">
            <h3 className="text-red-500 font-bold text-lg mb-3 flex items-center justify-center gap-2">
              <span className="text-2xl">⚠️</span> Ошибка заполнения
            </h3>
            <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
              Пожалуйста, заполните все обязательные поля (Имя, Email, Telegram). Убедитесь, что email указан корректно.
            </p>
            <button 
              onClick={() => setShowErrorModal(false)}
              className="w-full py-3 bg-neutral-900 text-white rounded-xl font-bold text-sm"
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      <LegalModal 
        isOpen={legalModal.isOpen}
        type={legalModal.type}
        onClose={() => setLegalModal(p => ({ ...p, isOpen: false }))}
        language={language}
      />
    </div>
  );
}

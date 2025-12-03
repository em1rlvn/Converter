const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('from');
const toSelect = document.getElementById('to');
const resultDiv = document.getElementById('result');
const rateDiv = document.getElementById('rate');
const updatedDiv = document.getElementById('updated');
const swapBtn = document.getElementById('swap');

const currencies = {
    USD: "Доллар США 🇺🇸",
    EUR: "Евро 🇪🇺",
    RUB: "Российский рубль 🇷🇺",
    KGS: "Кыргызский сом 🇰🇬",
    GBP: "Британский фунт 🇬🇧",
    JPY: "Японская иена 🇯🇵",
    CNY: "Китайский юань 🇨🇳",
    KZT: "Казахстанский тенге 🇰🇿",
    UAH: "Украинская гривна 🇺🇦",
    BYN: "Белорусский рубль 🇧🇾",
    CHF: "Швейцарский франк 🇨🇭",
    CAD: "Канадский доллар 🇨🇦",
    AUD: "Австралийский доллар 🇦🇺",
    PLN: "Польский злотый 🇵🇱",
    TRY: "Турецкая лира 🇹🇷",
    INR: "Индийская рупия 🇮🇳"
};

Object.keys(currencies).forEach(code => {
    const opt1 = new Option(`${code} — ${currencies[code]}`, code);
    const opt2 = new Option(`${code} — ${currencies[code]}`, code);
    fromSelect.add(opt1);
    toSelect.add(opt2);
});

fromSelect.value = 'USD';
toSelect.value = 'RUB';

let rates = {};
let currentBase = 'USD';

const fallbackRates = {
    AED: 3.6725, AFN: 70.5, ALL: 92.5, AMD: 387.5, ANG: 1.79, AOA: 890, ARS: 1050,
    AUD: 1.5, AWG: 1.8, AZN: 1.7, BAM: 1.8, BBD: 2, BDT: 117, BGN: 1.95,
    BHD: 0.377, BIF: 2860, BMD: 1, BND: 1.35, BOB: 6.9, BRL: 6.2, BSD: 1,
    BTC: 0.000023, BTN: 83, BWP: 13.5, BYN: 3.3, BZD: 2.02, CAD: 1.4, CDF: 2770,
    CHE: 0.92, CHF: 0.92, CHW: 0.92, CLF: 0.032, CLP: 950, CNH: 7.35, CNY: 7.35,
    COP: 4100, COU: 1, CRC: 510, CUC: 1, CUP: 24, CVE: 110, CZK: 24, DJF: 177.7,
    DKK: 7.46, DOP: 59, DZD: 134, EGP: 49, ERN: 15, ETB: 128, EUR: 0.92,
    FJD: 2.25, FKP: 0.79, GBP: 0.79, GEL: 2.73, GHS: 15.5, GIP: 0.79, GMD: 68,
    GNF: 8600, GTQ: 7.75, GYD: 210, HKD: 7.85, HNL: 24.5, HRK: 6.9, HTG: 132,
    HUF: 370, IDR: 16500, ILS: 3.8, INR: 83, IQD: 1310, IRR: 42000, ISK: 137,
    JMD: 156, JOD: 0.71, JPY: 149, JWL: 0.000036, KES: 129, KGS: 85, KHR: 4100,
    KMF: 493, KPW: 900, KRW: 1310, KWD: 0.307, KYD: 0.83, KZT: 430, LAK: 21000,
    LBP: 89500, LKR: 330, LRD: 190, LSL: 18, LYD: 4.85, MAD: 10.2, MDL: 17.8,
    MGA: 4380, MKD: 61.5, MMK: 2100, MNT: 3400, MOP: 8.05, MRU: 39.5, MUR: 46,
    MVR: 15.4, MWK: 1600, MXN: 17, MYR: 4.7, MZN: 64, NAD: 18, NGN: 1550,
    NIO: 36.5, NOK: 10.8, NPR: 132, NZD: 1.65, OMR: 0.385, PAB: 1, PEN: 3.9,
    PGK: 3.55, PHP: 56, PKR: 278, PLN: 4.1, PYG: 7400, QAR: 3.64, RON: 4.97,
    RSD: 117, RUB: 98, RWF: 1300, SAR: 3.75, SBD: 8.4, SCR: 13.5, SDG: 475,
    SEK: 10.5, SGD: 1.35, SHP: 0.79, SLL: 19500, SOS: 570, SRD: 33.5, SSP: 130,
    STN: 24.5, SYP: 12900, SZL: 18, THB: 37, TJS: 10.7, TMT: 3.5, TND: 3.1,
    TOP: 2.4, TRY: 33, TTD: 6.75, TWD: 32, TZS: 2650, UAH: 41.5, UGX: 3700,
    USD: 1, UYU: 42, UZS: 12500, VES: 2150000, VND: 24500, VUV: 121, WST: 2.85,
    XAF: 655, XAG: 0.000036, XAU: 0.00005, XBA: 1, XBB: 1, XBC: 1, XBD: 1,
    XCD: 2.7, XDR: 0.75, XOF: 655, XPD: 0.00009, XPF: 120, XPT: 0.00008, XSU: 1,
    XTS: 1, XUA: 1, XXX: 1, YER: 250, ZAR: 18.5, ZMW: 27, ZWL: 32000
};

async function loadRates(base = 'USD') {
    if (currentBase === base && Object.keys(rates).length > 0) {
        convert();
        return;
    }

    try {
        resultDiv.textContent = 'Загрузка курсов…';
        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!data.rates) throw new Error('Нет данных');

        rates = data.rates;
        currentBase = base;
        updatedDiv.textContent = `Обновлено: ${new Date().toLocaleString('ru-RU')}`;
        rateDiv.textContent = ''; 
        convert();
    } catch (err) {
        console.warn('API ошибка, используются резервные курсы:', err);
        
        rates = { ...fallbackRates };
        currentBase = base;
        updatedDiv.textContent = `Резервные курсы: 03.12.2025`;
        convert();
    }
}

function convert() {
    const amount = parseFloat(amountInput.value) || 0;
    const from = fromSelect.value;
    const to = toSelect.value;

    if (amount === 0) {
        resultDiv.textContent = '—';
        return;
    }

    if (from === to) {
        resultDiv.textContent = amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ` ${to}`;
        rateDiv.textContent = `1 ${from} = 1 ${to}`;
        return;
    }

    let rateTo;
    if (currentBase === from) {
        
        rateTo = rates[to] || 1;
    } else if (rates[from] && rates[to]) {
        
        rateTo = rates[to] / rates[from];
    } else {
        
        rateTo = (fallbackRates[to] || 1) / (fallbackRates[from] || 1);
    }

    const result = amount * rateTo;
    rateDiv.textContent = `1 ${from} = ${rateTo.toFixed(4)} ${to}`;

    const resultText = result.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ` <span style="font-size: 0.7em; opacity: 0.8;">${to}</span>`;
    resultDiv.innerHTML = resultText;
    
    const textLength = resultText.length;
    if (textLength > 20) {
        resultDiv.style.fontSize = '24px';
    } else if (textLength > 15) {
        resultDiv.style.fontSize = '28px';
    } else {
        resultDiv.style.fontSize = '32px';
    }
}

swapBtn.addEventListener('click', () => {
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    if (currentBase !== fromSelect.value) loadRates(fromSelect.value);
    else convert();
});

amountInput.addEventListener('input', convert);
fromSelect.addEventListener('change', () => {
    if (currentBase !== fromSelect.value) loadRates(fromSelect.value);
    else convert();
});
toSelect.addEventListener('change', convert);

loadRates();
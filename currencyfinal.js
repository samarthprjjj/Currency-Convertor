const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const amount = document.getElementById("amount");
const historyList = document.getElementById("historyList");
const clearBtn = document.getElementById("clearHistory");

let history = JSON.parse(localStorage.getItem("history")) || [];

const result = document.getElementById("resultid");
const rateText = document.getElementById("rateid");

const convertBtn = document.getElementById("convertBtn");
const swapBtn = document.getElementById("swapBtn");

const countryList = {
USD: "US", INR: "IN", EUR: "EU", GBP: "GB", JPY: "JP",
AUD: "AU", CAD: "CA", CNY: "CN"
};

async function loadCurrencies() {
const res = await fetch("https://open.er-api.com/v6/latest/USD");
const data = await res.json();

Object.keys(data.rates).forEach(cur => {
let opt1 = new Option(cur, cur);
let opt2 = new Option(cur, cur);
fromCurrency.add(opt1);
toCurrency.add(opt2);
});

fromCurrency.value = "USD";
toCurrency.value = "INR";

updateFlag("fromCurrency", "fromFlag");
updateFlag("toCurrency", "toFlag");
}

loadCurrencies();

function updateFlag(selectId, flagId) {
const currency = document.getElementById(selectId).value;
const code = countryList[currency] || "US";
document.getElementById(flagId).src =
`https://flagsapi.com/${code}/flat/64.png`;
}

fromCurrency.addEventListener("change", () =>
updateFlag("fromCurrency", "fromFlag"));

toCurrency.addEventListener("change", () =>
updateFlag("toCurrency", "toFlag"));

const toggleBtn = document.getElementById("darkToggle");


if (localStorage.getItem("mode") === "dark") {
  document.body.classList.add("dark");
}

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("mode", "dark");
  } else {
    localStorage.setItem("mode", "light");
  }
});

convertBtn.addEventListener("click", convert);

async function convert() {

const amt = Number(amount.value);
let loader = document.getElementById("loader");

if (!amt) return alert("Enter amount");

loader.style.display = "block";
convertBtn.disabled = true;
convertBtn.innerText = "Converting...";

result.innerText = "";
rateText.innerText = "";

const from = fromCurrency.value;
const to = toCurrency.value;

try {
await new Promise(resolve => setTimeout(resolve, 3000));


const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
const data = await res.json();

const rate = data.rates[to];
const final = amt * rate;

result.innerText = `${final.toFixed(2)} ${to}`;
rateText.innerText = `1 ${from} = ${rate.toFixed(4)} ${to}`;
addToHistory(amt, from, to, final);

convertBtn.innerText = "Converted ✅";


} catch (err) {
result.innerText = "Error to fetch the data";
}
finally{
    convertBtn.disabled = false;
    loader.style.display = "none";

}


}

function addToHistory(amount, from, to, converted) {
  const entry = `${amount} ${from} → ${converted} ${to}`;

  history.push(entry);

  // limit history (last 10)
  if (history.length > 10) history.shift();

  localStorage.setItem("history", JSON.stringify(history));

  displayHistory();
}

function displayHistory() {
  historyList.innerHTML = "";

  history.slice().reverse().forEach(item => {
    const li = document.createElement("li");
    li.innerText = item;
    historyList.appendChild(li);
  });
}

clearBtn.addEventListener("click", () => {
  localStorage.removeItem("history");
  history = [];
  displayHistory();
});


// here swapping
swapBtn.addEventListener("click", () => {
let temp = fromCurrency.value;
fromCurrency.value = toCurrency.value;
toCurrency.value = temp;

updateFlag("fromCurrency", "fromFlag");
updateFlag("toCurrency", "toFlag");
});

document.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    convert(); 
  }
});


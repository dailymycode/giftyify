let currentStep = 1;
const totalSteps = 5;

function showStep(step) {
  for (let i = 1; i <= totalSteps; i++) {  //bölüm sayısı
    const card = document.getElementById("step" + i);
    card.classList.toggle("active", i === step);
  }

  const progressPercent = ((step - 1) / (totalSteps - 1)) * 100;
  document.getElementById("progress").style.width = progressPercent + "%";

  document.getElementById("prevBtn").disabled = step === 1;
  const nextBtn = document.getElementById("nextBtn");
  nextBtn.innerText = step === totalSteps ? "🎁 Hediye Öner" : "İleri";
  nextBtn.disabled = !validateStep(step);
}

function changeStep(n) {
  if (n === 1 && !validateStep(currentStep)) return;

  currentStep += n;

  if (currentStep > totalSteps) {
    handleGiftRecommendation(); // AI'dan öneri 
    return;
  }

  showStep(currentStep);
}

function validateStep(step) {
  if (step === 1) return !!document.getElementById("recipient").value;
  if (step === 3) return !!document.getElementById("giftType").value;
  if (step === 4) return !!document.getElementById("occasion").value;
  return true;
}

function updatePriceLabel(val) {
  document.getElementById("priceValue").textContent = val + " TL";
}

async function handleGiftRecommendation() {
  const recipient = document.getElementById("recipient").value;
  const price = document.getElementById("priceRange").value;
  const type = document.getElementById("giftType").value;
  const reason = document.getElementById("occasion").value;
  const idea = document.getElementById("idea").value;
  

  const prompt = `
    Kullanıcı ${recipient} için bir hediye arıyor.
    Sebep: ${reason}.
    Bütçe: ${price} TL.
    Hediye türü: ${type}.
    Ek fikir: ${idea || "Yok"}.
    Lütfen bu bilgilerle kısa, yaratıcı ve direkt bir hediye önerisi sun.
    Sadece 2,3 cümle yaz ve en son kısımda önerdiğin hediyenin ismini yaz; Önerilen Hediye: {hediye ismi}
  `;

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "🎁 AI önerisi getiriliyor...";

  try {
    // Burada localhost:3000 portu ile backend'e tam URL yazdım
    const response = await fetch("http://localhost:3000/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const text = await response.text();
    console.log("🧪 Sunucu yanıtı (ham):", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error("Gelen yanıt geçerli JSON değil.");
    }

    const suggestion = data.text || "Hediye önerisi alınamadı.";
    //aiden gelen yanıta göre aramamızı şekillendirdik.
    const match = suggestion.match(/Önerilen hediye:\s*(.+)/i);
    const productName = match ? match[1].trim() : null;
    

let linksHTML = "";
if (productName) {
  const encoded = encodeURIComponent(productName);
  const trendyolLink = `https://www.google.com/search?q=site:trendyol.com+${encoded}`;
  const amazonLink = `https://www.google.com/search?q=site:amazon.com.tr+${encoded}`;

  linksHTML = `
    <h4>🔗 Ürünü incele:</h4>
    <ul>
      <li>
   <a href="${trendyolLink}" target="_blank" class="button-trendyol">
          <img src="images/trendyol.png" alt="ikon" class="button-icon">
          Trendyol’da Ara
        </a>
</li>
     <li>
 
        <a href="${amazonLink}" target="_blank" class="button-amazon">
          <img src="images/amazon.png" alt="Amazon İkon" class="button-icon">
          Amazon’da Ara
        </a>
</li>

    </ul>
  `;
}

    resultsDiv.innerHTML = `
      <h3>🎉 AI Hediye Önerisi:</h3>
      <p>${suggestion}</p>
      ${linksHTML}
    `;
  } catch (err) {
    resultsDiv.innerHTML = "❌ Bir hata oluştu: " + err.message;
  }

  currentStep = 1;
  showStep(currentStep);
}

document.querySelectorAll("select, input").forEach((el) => {
  el.addEventListener("input", () => {
    showStep(currentStep);
  });
});

window.onload = () => {
  showStep(currentStep);
  updatePriceLabel(document.getElementById("priceRange").value);
};

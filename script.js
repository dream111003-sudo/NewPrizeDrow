const API_BASE = "https://script.google.com/macros/s/AKfycbx2QwPyoeEAzWqrg8LD746pP2Yaq087AMV6nrTz0ju4JVbMc4SU_2t8_Ezgc8Z1vnCJFQ/exec";

const winnersCountEl = document.getElementById("winnersCount");
const remainingCountEl = document.getElementById("remainingCount");
const resultEl = document.getElementById("result");
const drawButton = document.getElementById("drawButton");
const bgm = document.getElementById("bgm");

async function updateStatus() {
  try {
    const res = await fetch(`${API_BASE}?action=status`);
    const data = await res.json();
    winnersCountEl.textContent = data.winnersCount;
    remainingCountEl.textContent = data.remainingCount;
  } catch (err) {
    console.error("ステータス更新失敗:", err);
  }
}

async function drawPrize() {
  try {
    const res = await fetch(`${API_BASE}?action=draw`);
    const data = await res.json();
    if (data.success) {
      resultEl.textContent = `🎉 当選！ 景品: ${data.prize}`;
      bgm.currentTime = 0;
      bgm.play();
    } else {
      resultEl.textContent = "はずれ…";
    }
    updateStatus();
  } catch (err) {
    console.error("抽選失敗:", err);
  }
}

drawButton.addEventListener("click", drawPrize);
updateStatus();

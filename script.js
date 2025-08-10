const API_URL = "https://script.google.com/macros/s/AKfycbx2QwPyoeEAzWqrg8LD746pP2Yaq087AMV6nrTz0ju4JVbMc4SU_2t8_Ezgc8Z1vnCJFQ/exec";

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const drawBtn = document.getElementById("drawBtn");
  const resultDiv = document.getElementById("result");
  const prizeImageDiv = document.getElementById("prizeImage");
  const bgm = document.getElementById("bgm");

  // 紙吹雪Canvas設定
  const confettiCanvas = document.getElementById("confettiCanvas");
  const ctx = confettiCanvas.getContext("2d");
  let confettiParticles = [];

  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function createConfetti() {
    for (let i = 0; i < 200; i++) {
      confettiParticles.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        size: Math.random() * 6 + 4,
        speed: Math.random() * 3 + 2,
        drift: Math.random() * 2 - 1
      });
    }
  }

  function drawConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.y += p.speed;
      p.x += p.drift;
      if (p.y > confettiCanvas.height) {
        p.y = -10;
        p.x = Math.random() * confettiCanvas.width;
      }
    });
    requestAnimationFrame(drawConfetti);
  }

  // 抽選状況更新
  function updateStatus() {
    fetch(`${API_URL}?mode=status`)
      .then(res => res.json())
      .then(data => {
        document.getElementById("statusArea").innerHTML =
          `当選者数: ${data.winners} / ${data.totalPrizes}<br>残り景品数: ${data.remainingPrizes}`;
        if (data.isFinished) showWinners(data.list);
      });
  }

  // 抽選処理
  drawBtn.addEventListener("click", () => {
    if (!id) {
      alert("参加者IDがありません");
      return;
    }
    fetch(`${API_URL}?mode=draw&id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          resultDiv.innerHTML = `🎁 ${data.participant.name} さん当選！<br>景品: ${data.prize}`;
          resultDiv.classList.add("result-animate");

// 景品画像表示（prizes/ 内に置く想定）
// ※ public/prizes に prize1.jpg などを格納する
prizeImageDiv.innerHTML = `<img src="/prizes/${data.prizeImage}" alt="${data.prize}" style="max-width:300px; height:auto;">`;


          startCelebration();
        } else if (data.status === "already_drawn") {
          resultDiv.innerHTML = `⚠️ すでに抽選済みです<br>景品: ${data.prize}`;
        } else if (data.status === "finished") {
          resultDiv.innerHTML = "全ての景品が終了しました";
        }
        updateStatus();
      });
  });

  function startCelebration() {
    bgm.currentTime = 0;
    bgm.play();
    confettiParticles = [];
    createConfetti();
    drawConfetti();
    setTimeout(() => {
      confettiParticles = [];
    }, 5000);
  }

  // 当選者一覧表示
function showWinners(list) {
  const style = `
    <style>
      table.winner-table {
        border-collapse: separate;
        border-spacing: 0;
        width: 90%;
        max-width: 800px;
        margin: 20px auto;
        font-family: "Comic Sans MS", cursive, sans-serif;
        box-shadow: 0 6px 12px rgba(0,0,0,0.1);
        border-radius: 15px;
        overflow: hidden;
        background: #fff;
      }
      table.winner-table th, table.winner-table td {
        padding: 14px 18px;
        text-align: center;
      }
      table.winner-table thead th {
        background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
        color: #fff;
        font-weight: bold;
        font-size: 1.15em;
        letter-spacing: 1.5px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.15);
      }
      table.winner-table tbody tr {
        background: #fff8f0;
        transition: background-color 0.25s ease;
      }
      table.winner-table tbody tr:nth-child(even) {
        background: #fff1e6;
      }
      table.winner-table tbody tr:hover {
        background: #ffd1dc;
      }
      table.winner-table tbody td img {
        max-width: 80px;
        border-radius: 12px;
        border: 3px solid #ff9a9e;
        box-shadow: 0 4px 8px rgba(255,154,158,0.3);
        transition: transform 0.3s ease;
      }
      table.winner-table tbody td img:hover {
        transform: scale(1.1);
        border-color: #fad0c4;
        box-shadow: 0 6px 12px rgba(250,208,196,0.5);
      }
      h2 {
        text-align: center;
        color: #ff6f91;
        font-family: "Comic Sans MS", cursive, sans-serif;
        font-weight: 900;
        text-shadow: 2px 2px 4px #ffd1dc;
        margin-top: 30px;
      }
    </style>
  `;

  let html = style + "<h2>当選者一覧</h2>";
  html += "<table class='winner-table'>";
  html += "<thead><tr><th>ID</th><th>氏名</th><th>景品</th><th>画像</th></tr></thead><tbody>";
  list.forEach(w => {
    html += `<tr>
      <td>${w.id}</td>
      <td>${w.name}</td>
      <td>${w.prize}</td>
      <td><img src="prizes/${w.prizeImage}" alt="${w.prize}"></td>
    </tr>`;
  });
  html += "</tbody></table>";
  document.getElementById("mainArea").innerHTML = html;
}


  setInterval(updateStatus, 5000);
  updateStatus();
});



// ------------------ Abas ------------------
const tabs = document.querySelectorAll('.tab-button');
const sections = document.querySelectorAll('section');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// ------------------ Frases Motivacionais ------------------
const frases = [
    "Cada página estudada é um passo para vestir a farda.",
    "Você estuda hoje para honrar quem sempre acreditou em você.",
    "Quem treina no silêncio, constrói um futuro que ninguém pode derrubar.",
    "Você não quer só passar — você quer ser orgulho para sua família.",
    "Estudar é construir a sua própria chance de vitória.",
    "Persistência hoje é sucesso amanhã.",
    "Não desista, cada esforço conta.",
    "Disciplina transforma sonhos em realidade.",
    "O suor de hoje é a glória de amanhã.",
    "Treine seu corpo e mente, eles são seus maiores aliados."
];

const motivationText = document.getElementById("motivationText");
function mostrarFrase() {
    motivationText.innerText = frases[Math.floor(Math.random() * frases.length)];
}
mostrarFrase();
setInterval(mostrarFrase, 15000);

// ------------------ Matérias ------------------
const materias = [
    "Língua Portuguesa",
    "Matemática / Raciocínio Lógico",
    "História, Geografia e Atualidades",
    "Direitos Humanos / Cidadania",
    "Informática",
    "Legislação / Noções de Direito",
    "Direito Penal Militar / Criminologia / Segurança Pública"
];

const subjectList = document.getElementById("subjectList");
materias.forEach(materia => {
    let li = document.createElement("li");
    let span = document.createElement("span");
    span.textContent = materia;
    span.classList.add("materia");

    let record = document.createElement("div");
    record.classList.add("day-record");

    let botao = document.createElement("button");
    botao.textContent = "Estudei hoje";

    botao.onclick = function() {
        let today = new Date().toLocaleDateString();
        record.innerHTML += `✔ ${today}<br>`;
        botao.disabled = true;
        botao.classList.add("marked");

        let saved = JSON.parse(localStorage.getItem("estudos")) || {};
        if(!saved[materia]) saved[materia] = [];
        saved[materia].push(today);
        localStorage.setItem("estudos", JSON.stringify(saved));

        updateStreak();
        updateMedals();
        updatePoints();
        updateLevel();
        updateChart();
        updateHeatMap();
        notificarHoje(materia);
    };

    let savedData = JSON.parse(localStorage.getItem("estudos")) || {};
    if(savedData[materia]) {
        savedData[materia].forEach(date => {
            record.innerHTML += `✔ ${date}<br>`;
        });
    }

    li.appendChild(span);
    li.appendChild(botao);
    li.appendChild(record);
    subjectList.appendChild(li);
});

document.getElementById("searchInput").addEventListener("input", function() {
    let filtro = this.value.toLowerCase();
    const items = subjectList.querySelectorAll("li");
    items.forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(filtro) ? "" : "none";
    });
});

// ------------------ Gamificação ------------------
const streakEl = document.getElementById("streak");
const medalsEl = document.getElementById("medals");
const pointsEl = document.getElementById("points");
const levelEl = document.getElementById("level");

function updateStreak() {
    const saved = JSON.parse(localStorage.getItem("estudos")) || {};
    let streak = 0;
    let today = new Date();
    for(let i=0;i<7;i++){
        let day = new Date(today);
        day.setDate(today.getDate()-i);
        let dayStr = day.toLocaleDateString();
        let found = Object.values(saved).some(arr => arr.includes(dayStr));
        if(found) streak++; else break;
    }
    streakEl.innerText = `Dias seguidos estudando: ${streak}`;
    return streak;
}

function updateMedals() {
    let streak = updateStreak();
    if(streak >= 7) medalsEl.innerText = "Medalhas: 🏅";
    else if(streak >= 3) medalsEl.innerText = "Medalhas: 🥈";
    else medalsEl.innerText = "Medalhas: Nenhuma";
}

function updatePoints() {
    let saved = JSON.parse(localStorage.getItem("estudos")) || {};
    let points = Object.values(saved).reduce((acc, arr) => acc + arr.length, 0);
    pointsEl.innerText = `Pontos: ${points}`;
}

function updateLevel() {
    let points = Object.values(JSON.parse(localStorage.getItem("estudos")) || {}).reduce((acc, arr) => acc + arr.length, 0);
    let level = "Novato";
    if(points >= 50) level = "Recruta";
    if(points >= 100) level = "Soldado";
    if(points >= 200) level = "Oficial";
    if(points >= 400) level = "Campeão PM";
    levelEl.innerText = `Nível: ${level}`;
}

updateMedals();
updatePoints();
updateLevel();

// ------------------ Gráficos ------------------
const ctx = document.getElementById('progressChart').getContext('2d');
let progressChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: materias,
        datasets: [{
            label: 'Dias estudados',
            data: materias.map(m => {
                let saved = JSON.parse(localStorage.getItem("estudos")) || {};
                return saved[m] ? saved[m].length : 0;
            }),
            backgroundColor: '#ffd60a'
        }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true, stepSize: 1 } } }
});

function updateChart() {
    progressChart.data.datasets[0].data = materias.map(m => {
        let saved = JSON.parse(localStorage.getItem("estudos")) || {};
        return saved[m] ? saved[m].length : 0;
    });
    progressChart.update();
}

// ------------------ Heat Map ------------------
const heatCtx = document.getElementById('heatChart').getContext('2d');
let heatChart = new Chart(heatCtx, {
    type: 'line',
    data: {
        labels: Array.from({length:7},(_,i)=>`Dia ${i+1}`),
        datasets: [{
            label:'Tópicos revisados',
            data: [0,0,0,0,0,0,0],
            borderColor:'#ffd60a',
            backgroundColor:'rgba(255, 214, 10,0.2)'
        }]
    },
    options:{responsive:true, scales:{y:{beginAtZero:true, stepSize:1}}}
});

function updateHeatMap() {
    const saved = JSON.parse(localStorage.getItem("estudos")) || {};
    let last7 = Array(7).fill(0);
    let today = new Date();
    for(let i=0;i<7;i++){
        let day = new Date(today);
        day.setDate(today.getDate()-i);
        let dayStr = day.toLocaleDateString();
        let count = Object.values(saved).filter(arr=>arr.includes(dayStr)).length;
        last7[6-i] = count;
    }
    heatChart.data.datasets[0].data = last7;
    heatChart.update();
}

// ------------------ Reset semanal ------------------
document.getElementById("resetButton").onclick = function() {
    if(confirm("Deseja resetar todos os registros da semana?")) {
        localStorage.removeItem("estudos");
        location.reload();
    }
};

// ------------------ Tema ------------------
document.getElementById("themeButton").onclick = function() {
    document.body.classList.toggle("light");
};

// ------------------ Exportar CSV ------------------
document.getElementById("exportButton").onclick = function() {
    let saved = JSON.parse(localStorage.getItem("estudos")) || {};
    let csv = "Matéria,Datas\n";
    for(let m in saved){
        csv += `${m},"${saved[m].join(';')}"\n`;
    }
    let blob = new Blob([csv], {type:"text/csv"});
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "historico_estudos.csv";
    a.click();
};

// ------------------ Pomodoro Completo ------------------
let pomodoroTime = 120*60; // Inicial: 2 horas em segundos
let pomodoroTimer;
let isRunning = false;
let sessionCount = 0;

const pomodoroDisplay = document.getElementById("pomodoroTimer");
const sessionDisplay = document.getElementById("pomodoroSessionCount");
const pomodoroSelect = document.getElementById("pomodoroSelect");

function atualizarDisplay() {
    let hours = Math.floor(pomodoroTime / 3600);
    let minutes = Math.floor((pomodoroTime % 3600) / 60);
    let seconds = pomodoroTime % 60;
    let hStr = hours.toString().padStart(2,'0');
    let mStr = minutes.toString().padStart(2,'0');
    let sStr = seconds.toString().padStart(2,'0');
    if(hours > 0){
        pomodoroDisplay.innerText = `${hStr}:${mStr}:${sStr}`;
    } else {
        pomodoroDisplay.innerText = `${mStr}:${sStr}`;
    }
}

atualizarDisplay();

pomodoroSelect.addEventListener("change", () => {
    pomodoroTime = parseInt(pomodoroSelect.value)*60;
    atualizarDisplay();
});

document.getElementById("startPomodoro").onclick = function() {
    if(!isRunning) {
        isRunning = true;
        pomodoroTimer = setInterval(() => {
            if(pomodoroTime <= 0){
                clearInterval(pomodoroTimer);
                isRunning = false;
                sessionCount++;
                sessionDisplay.innerText = `Sessões concluídas: ${sessionCount}`;
                pomodoroTime = parseInt(pomodoroSelect.value)*60;
                atualizarDisplay();
                alert(`Pomodoro de ${pomodoroSelect.value} horas concluído! Descanso de 5 min.`);
            } else {
                pomodoroTime--;
                atualizarDisplay();
            }
        }, 1000);
    }
};

document.getElementById("pausePomodoro").onclick = function() {
    clearInterval(pomodoroTimer);
    isRunning = false;
};

document.getElementById("resetPomodoro").onclick = function() {
    clearInterval(pomodoroTimer);
    isRunning = false;
    pomodoroTime = parseInt(pomodoroSelect.value)*60;
    atualizarDisplay();
};

// ------------------ Notificações motivacionais ao estudar ------------------
function notificarHoje(materia) {
    if(Notification.permission === "granted") {
        new Notification("Bom trabalho!", {
            body: `Você estudou ${materia} hoje! Continue assim!`
        });
    } else if(Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if(permission === "granted") notificarHoje(materia);
        });
    }
}

// Seleciona textarea e botão
const quickNotes = document.getElementById("quickNotes");
const saveNotesBtn = document.getElementById("saveNotes");

// Carrega notas salvas ao iniciar
quickNotes.value = localStorage.getItem("quickNotes") || "";

// Salva notas ao clicar no botão
saveNotesBtn.onclick = function() {
    localStorage.setItem("quickNotes", quickNotes.value);
    alert("Notas salvas com sucesso!");
};

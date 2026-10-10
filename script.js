
"use strict";

const $ = (selector) => document.querySelector(selector);

const plans = {
  Monday: {
    name: "Chest + Triceps",
    exercises: [
      "Bench Press", "Incline Dumbbell Press", "Chest Dips",
      "Cable Fly", "Triceps Pushdown", "Overhead Triceps Extension"
    ]
  },
  Tuesday: {
    name: "Back + Biceps",
    exercises: [
      "Lat Pulldown", "Chest-Supported Row", "T-Bar Row",
      "Face Pull", "Dumbbell Curl", "Hammer Curl"
    ]
  },
  Wednesday: {
    name: "Legs + Abs",
    exercises: [
      "Squats", "Leg Press", "Leg Curl", "Leg Extension",
      "Standing Calf Raises", "Plank"
    ]
  },
  Thursday: {
    name: "Shoulders + Traps",
    exercises: [
      "Overhead Press", "Lateral Raises", "Rear Delt Fly",
      "Dumbbell Shrugs", "Upright Cable Row", "Neck Isometrics"
    ]
  },
  Friday: {
    name: "Arms + Forearms",
    exercises: [
      "EZ-Bar Curl", "Incline Dumbbell Curl", "Triceps Pushdown",
      "Overhead Triceps Extension", "Wrist Curls", "Reverse Wrist Curls"
    ]
  },
  Saturday: {
    name: "Upper Body + Core",
    exercises: [
      "Incline Bench Press", "Lat Pulldown", "Seated Cable Row",
      "Lateral Raises", "Cable Crunches", "Hanging Knee Raises"
    ]
  },
  Sunday: {
    name: "Rest + Recovery",
    exercises: [
      "Easy Walking", "Gentle Mobility", "Light Stretching"
    ]
  }
};

const days = Object.keys(plans);

const habits = [
  "Workout or recovery completed",
  "Protein with meals",
  "Enough water",
  "7–9 hours sleep",
  "10 minutes of mobility"
];

const storageKey = "fittrack-v1";

function freshState() {
  return {
    selectedDay: days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1],
    completed: {},
    habitChecks: {},
    water: 0,
    weights: [],
    notes: "",
    lastDate: localDate()
  };
}

function localDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && typeof saved === "object") {
      return { ...freshState(), ...saved };
    }
  } catch (error) {
    console.warn("Could not load saved data:", error);
  }
  return freshState();
}

let state = loadState();

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.error("Could not save data:", error);
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function completedCount(day) {
  return plans[day].exercises.filter(
    exercise => state.completed[`${day}:${exercise}`]
  ).length;
}

function allCompletedCount() {
  return Object.values(state.completed).filter(Boolean).length;
}

function habitCount() {
  return habits.filter(habit => state.habitChecks[habit]).length;
}

function selectDay(day) {
  if (!plans[day]) return;
  state.selectedDay = day;
  saveState();
  render();
}

function renderDayPicker(containerId) {
  const container = $(containerId);

  container.innerHTML = days.map(day => `
    <button class="day-btn ${day === state.selectedDay ? "selected" : ""}"
      data-day="${day}">
      <strong>${day.slice(0, 3)}</strong>
      <span>${escapeHTML(plans[day].name)}</span>
    </button>
  `).join("");

  container.querySelectorAll("[data-day]").forEach(button => {
    button.addEventListener("click", () => {
      selectDay(button.dataset.day);
    });
  });
}

function renderWorkout() {
  const day = state.selectedDay;
  const plan = plans[day];
  const count = completedCount(day);
  const total = plan.exercises.length;
  const percent = total ? count / total * 100 : 0;

  $("#workoutName").textContent = `${day} · ${plan.name}`;
  $("#workoutSummary").textContent = `${count} of ${total} exercises completed`;
  $("#workoutBar").style.width = `${percent}%`;

  $("#exerciseList").innerHTML = plan.exercises.map((exercise, index) => {
    const key = `${day}:${exercise}`;
    const checked = Boolean(state.completed[key]);

    return `
      <div class="exercise ${checked ? "completed" : ""}">
        <input type="checkbox" id="exercise-${index}"
          data-exercise="${index}" ${checked ? "checked" : ""}>
        <label for="exercise-${index}">
          ${escapeHTML(exercise)}
          <small>${checked ? "Completed" : "Tap when finished"}</small>
        </label>
      </div>
    `;
  }).join("");

  $("#exerciseList").querySelectorAll("[data-exercise]").forEach(input => {
    input.addEventListener("change", () => {
      const exercise = plan.exercises[Number(input.dataset.exercise)];
      const key = `${day}:${exercise}`;

      if (input.checked) {
        state.completed[key] = true;
      } else {
        delete state.completed[key];
      }

      saveState();
      render();
    });
  });
}

function renderHome() {
  const day = state.selectedDay;
  const plan = plans[day];
  const count = completedCount(day);
  const total = plan.exercises.length;

  $("#homeWorkoutName").textContent = plan.name;
  $("#homeWorkoutInfo").textContent = `${total} exercises in this session`;
  $("#homeWorkoutCount").textContent = `${count} of ${total} completed`;
  $("#homeBar").style.width = `${count / total * 100}%`;

  $("#todayDate").textContent = new Date().toLocaleDateString(
    "en-IN", { day: "numeric", month: "short", year: "numeric" }
  );

  renderDayPicker("#dayPicker");
  renderDayPicker("#workoutDayPicker");
}

function renderHabits() {
  const count = habitCount();

  $("#habitSummary").textContent = `${count} of ${habits.length} completed`;
  $("#habitBar").style.width = `${count / habits.length * 100}%`;

  $("#habitList").innerHTML = habits.map((habit, index) => `
    <div class="habit">
      <input type="checkbox" id="habit-${index}"
        data-habit="${index}" ${state.habitChecks[habit] ? "checked" : ""}>
      <label for="habit-${index}">${escapeHTML(habit)}</label>
    </div>
  `).join("");

  $("#habitList").querySelectorAll("[data-habit]").forEach(input => {
    input.addEventListener("change", () => {
      const habit = habits[Number(input.dataset.habit)];
      state.habitChecks[habit] = input.checked;
      saveState();
      render();
    });
  });
}

function renderWeights() {
  const history = $("#weightHistory");

  if (!state.weights.length) {
    history.innerHTML = '<p class="muted">No measurements logged yet.</p>';
    return;
  }

  history.innerHTML = [...state.weights].reverse().map(entry => `
    <div class="history-item">
      <small>${escapeHTML(entry.date)}</small>
      <strong>${escapeHTML(entry.value)} kg</strong>
    </div>
  `).join("");
}

function renderStats() {
  $("#exerciseCount").textContent = allCompletedCount();
  $("#waterCount").textContent = `${state.water}/8`;
  $("#habitCount").textContent = `${habitCount()}/5`;
  $("#waterLabel").textContent = `${state.water} / 8`;

  $("#waterMinus").disabled = state.water <= 0;
  $("#waterPlus").disabled = state.water >= 8;
}

function render() {
  renderStats();
  renderHome();
  renderWorkout();
  renderHabits();
  renderWeights();

  if ($("#notesInput").value !== state.notes) {
    $("#notesInput").value = state.notes;
  }
}

function showTab(tabName) {
  document.querySelectorAll(".panel").forEach(panel => {
    panel.classList.toggle("hidden", panel.id !== tabName);
  });

  document.querySelectorAll(".tab").forEach(button => {
    const active = button.dataset.tab === tabName;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
}

document.querySelectorAll("[data-tab]").forEach(button => {
  button.addEventListener("click", () => showTab(button.dataset.tab));
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    showTab(button.dataset.go);
  });
});

$("#waterPlus").addEventListener("click", () => {
  state.water = Math.min(8, state.water + 1);
  saveState();
  render();
});

$("#waterMinus").addEventListener("click", () => {
  state.water = Math.max(0, state.water - 1);
  saveState();
  render();
});

$("#resetWorkout").addEventListener("click", () => {
  const prefix = `${state.selectedDay}:`;

  Object.keys(state.completed).forEach(key => {
    if (key.startsWith(prefix)) delete state.completed[key];
  });

  saveState();
  render();
});

$("#resetHabits").addEventListener("click", () => {
  state.habitChecks = {};
  saveState();
  render();
});

$("#weightForm").addEventListener("submit", event => {
  event.preventDefault();

  const value = Number($("#weightInput").value);

  if (!Number.isFinite(value) || value <= 0 || value >= 1000) {
    alert("Please enter a valid weight in kilograms.");
    return;
  }

  state.weights.push({ value, date: localDate() });
  saveState();
  $("#weightInput").value = "";
  render();
});

let noteTimer;

$("#notesInput").addEventListener("input", () => {
  state.notes = $("#notesInput").value;
  saveState();
  $("#notesStatus").textContent = "Saved in this browser.";
});

$("#exportData").addEventListener("click", () => {
  const file = new Blob(
    [JSON.stringify(state, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "fittrack-data.json";
  link.click();
  URL.revokeObjectURL(url);
});

function updateDayIfNeeded() {
  if (state.lastDate !== localDate()) {
    state.lastDate = localDate();
    state.water = 0;
    state.habitChecks = {};
    saveState();
  }
}

updateDayIfNeeded();
render();
showTab("home");

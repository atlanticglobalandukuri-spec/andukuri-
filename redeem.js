import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  update,
  get,
  set
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

// 🔹 Firebase configs
const redeemConfig = {
  apiKey: "AIzaSyBujHQv4FlfgNDPQWRrNTDp75JXmOG-PXU",
  authDomain: "redeem-database-c5994.firebaseapp.com",
  projectId: "redeem-database-c5994",
  storageBucket: "redeem-database-c5994.appspot.com",
  messagingSenderId: "400864661441",
  appId: "1:400864661441:web:100da8af889bcc49b5a940",
  measurementId: "G-XHRC7KZD6Z",
  databaseURL: "https://redeem-database-c5994-default-rtdb.firebaseio.com/"
};

const profileConfig = {
  apiKey: "AIzaSyDfHKmjYt0djroQtfEIclJzh6YmUh3x_Uw",
  authDomain: "profil-database.firebaseapp.com",
  projectId: "profil-database",
  storageBucket: "profil-database.appspot.com",
  messagingSenderId: "700901273067",
  appId: "1:700901273067:web:b011d12acb22bae245fdae",
  measurementId: "G-BHFD1WMNKY",
  databaseURL: "https://profil-database-default-rtdb.firebaseio.com/"
};

// 🔹 Initialize Firebase apps
const redeemApp = initializeApp(redeemConfig, "redeemDB");
const redeemDB = getDatabase(redeemApp);

const profileApp = initializeApp(profileConfig, "profileDB");
const profileDB = getDatabase(profileApp);

// 🔹 Popup
function showPopup(msg, type = "success") {
  const popup = document.getElementById("popup");
  popup.textContent = msg;
  popup.className = type === "success" ? "popup success" : "popup error";
  popup.style.display = "block";
  setTimeout(() => (popup.style.display = "none"), 2500);
}

// 🔹 User data
let currentUser = {
  uid: localStorage.getItem("uid"),
  email: localStorage.getItem("email"),
  score: parseInt(localStorage.getItem("score")) || 0
};

// 🔹 UI elements
const usernameDisplay = document.getElementById("usernameDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const todayCountDisplay = document.getElementById("todayCountDisplay");
const submitBtn = document.getElementById("submitRedeem");

usernameDisplay.innerText = currentUser.email || "Not logged in";
scoreDisplay.innerText = currentUser.score;

// 🔹 Enable / disable button
function updateButtonState() {
  submitBtn.disabled = !(currentUser.uid && currentUser.score >= 1500);
}
updateButtonState();

// 🔹 Load today redeem count
async function loadTodayCount() {
  const today = new Date().toISOString().slice(0, 10);
  const limitRef = ref(redeemDB, "dailyLimits/" + today);

  const snap = await get(limitRef);
  const count = snap.exists() ? snap.val() : 0;

  todayCountDisplay.textContent = count;
}
loadTodayCount();

// 🔹 Redeem click
submitBtn.addEventListener("click", async () => {
  const gameId = document.getElementById("redeemMessage").value.trim();

  if (!gameId) return showPopup("Please enter Game ID", "error");
  if (gameId.length > 20) return showPopup("Game ID too long", "error");
  if (currentUser.score < 1500) return showPopup("Not enough points", "error");

  try {
    const today = new Date().toISOString().slice(0, 10);
    const limitRef = ref(redeemDB, "dailyLimits/" + today);

    // 🔹 Check daily global limit
    const snap = await get(limitRef);
    let todayCount = snap.exists() ? snap.val() : 0;

    if (todayCount >= 1000) {
      return showPopup(
        "🚫 Daily redeem limit reached. Try again tomorrow.",
        "error"
      );
    }

    // 🔹 Deduct points
    const newScore = currentUser.score - 1500;

    // 🔹 Save redeem request
    await push(ref(redeemDB, "redeems"), {
      email: currentUser.email,
      gameId: gameId,
      date: today,
      //status: "pending"
    });

    // 🔹 Increase daily counter
    await set(limitRef, todayCount + 1);

    // 🔹 Update user score
    await update(ref(profileDB, "users/" + currentUser.uid), {
      score: newScore
    });

    // 🔹 Update UI + localStorage
    currentUser.score = newScore;
    localStorage.setItem("score", newScore);
    scoreDisplay.innerText = newScore;
    todayCountDisplay.innerText = todayCount + 1;

    updateButtonState();

    showPopup(
      "🎉 Redeem successful! Reward will be delivered within 1 week.",
      "success"
    );
  } catch (err) {
    showPopup("Error: " + err.message, "error");
  }
});

// 🔹 Back button
document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});

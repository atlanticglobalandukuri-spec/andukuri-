
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getDatabase, ref, push, update } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

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

// 🔹 Initialize databases
const redeemApp = initializeApp(redeemConfig, "redeemDB");
const redeemDB = getDatabase(redeemApp);
const profileApp = initializeApp(profileConfig, "profileDB");
const profileDB = getDatabase(profileApp);

// 🔹 Popup function
function showPopup(msg, type="success") {
  const popup = document.getElementById("popup");
  popup.textContent = msg;
  popup.className = type === "success" ? "popup success" : "popup error";
  popup.style.display = "block";
  setTimeout(() => popup.style.display = "none", 2500);
}

// 🔹 User data
let currentUser = {
  uid: localStorage.getItem("uid"),
  email: localStorage.getItem("email"),
  score: parseInt(localStorage.getItem("score")) || 0
};

const usernameDisplay = document.getElementById("usernameDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const submitBtn = document.getElementById("submitRedeem");

usernameDisplay.innerText = currentUser.email || "Not logged in";
scoreDisplay.innerText = currentUser.score;

// 🔹 Enable/disable redeem button
function updateButtonState() {
  submitBtn.disabled = !(currentUser.uid && currentUser.score >= 1500);
}
updateButtonState();

// 🔹 Redeem click
submitBtn.addEventListener("click", async () => {
  const message = document.getElementById("redeemMessage").value.trim();

  if (!message) return showPopup("Please enter Game ID.", "error");
  if (message.length > 20) return showPopup("Game ID too long!", "error");

  if (currentUser.score < 1500) return showPopup("Not enough points!", "error");

  try {
    // Deduct 1500 points
    const newScore = currentUser.score - 1500;

    // Push redeem record
    const today = new Date().toISOString().slice(0, 10);
    await push(ref(redeemDB, "redeems"), {
      email: currentUser.email,
      message,
      timestamp: today,
      // scoreAtRedeem: currentUser.score
    });

    // Update score in profile database
    await update(ref(profileDB, "users/" + currentUser.uid), { score: newScore });

    // Update local & UI
    currentUser.score = newScore;
    localStorage.setItem("score", newScore);
    scoreDisplay.textContent = newScore;

    // Disable if below 1500
    updateButtonState();

    showPopup("🎉 Redeem successful! 1500 points deducted. With in 1 week you will receive your reward.", "success");

  } catch (err) {
    showPopup("Error: " + err.message, "error");
  }
});

// 🔹 Back button
document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});


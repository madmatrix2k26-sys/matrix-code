
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQJsft5Tn2xhl27JNhWCLNEIFCsada1NU",
  authDomain: "matrix-code-37708562-32a3c.firebaseapp.com",
  projectId: "matrix-code-37708562-32a3c",
  storageBucket: "matrix-code-37708562-32a3c.firebasestorage.app",
  messagingSenderId: "970945351239",
  appId: "1:970945351239:web:5a6014cd8776ac4ebdeb62"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function registerUser(email, password) {
    try {
        await setDoc(doc(db, "participants", email), {
            email: email,
            password: password,
            score: 0,
            violations: 0,
            status: "Offline"
        });
        return { success: true, error: null };
    } catch (e) {
        console.error("Firebase Error: ", e);
        return { success: false, error: e.message };
    }
}

function startLiveLeaderboard() {
    const tableBody = document.querySelector("#leaderboard-body");
    
    onSnapshot(collection(db, "participants"), (querySnapshot) => {
        if (!tableBody) return;
        tableBody.innerHTML = "";
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            tableBody.innerHTML += `
                <tr class="border-b border-slate-700">
                    <td class="p-2">${data.email}</td>
                    <td class="p-2">${data.password}</td>
                    <td class="p-2">${data.score}</td>
                    <td class="p-2">${data.violations}</td>
                    <td class="p-2">${data.status}</td>
                </tr>`;
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    startLiveLeaderboard();

    const registerForm = document.getElementById('register-form');
    if (!registerForm) {
        console.error('Admin registration form not found.');
        return;
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = document.getElementById('student-email');
        const passwordInput = document.getElementById('student-password');
        const passwordDisplay = document.getElementById('password-display');

        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            passwordDisplay.innerText = 'Email and password are required.';
            passwordDisplay.style.color = 'red';
            return;
        }

        passwordDisplay.innerText = 'Registering student...';
        passwordDisplay.style.color = 'white';

        const result = await registerUser(email, password);

        if (result.success) {
            passwordDisplay.innerText = 'Student registered successfully!';
            passwordDisplay.style.color = 'lightgreen';
            emailInput.value = '';
            passwordInput.value = '';
        } else {
            passwordDisplay.innerText = `Registration failed. Please check Firestore rules. Error: ${result.error}`;
            passwordDisplay.style.color = 'red';
        }
    });
});

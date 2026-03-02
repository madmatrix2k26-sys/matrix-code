
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('admin-login-btn').addEventListener('click', () => {
        const password = prompt('Enter admin password:');
        if (password === 'MADMATRIX2026@123#') {
            window.location.href = 'admin.html';
        } else {
            alert('Incorrect password.');
        }
    });

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const docRef = doc(db, "participants", email);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().password === password) {
            sessionStorage.setItem('userEmail', email);
            const userRef = doc(db, "participants", email);
            await updateDoc(userRef, { status: "Online" });
            window.location.href = 'exam.html';
        } else {
            alert('Invalid credentials.');
        }
    });
});

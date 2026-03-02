
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const allQuestions = [
    {
        id: 1,
        title: "Factorial of a Number",
        buggyCode: `num = int(input("Enter a number: "))\nfact = 1\nfor i in range(1, num+1):\n    fact = fact * i\nprint("Factorial is:", fact)`,
        expectedInput: "5",
        expectedOutput: "Factorial is: 120"
    },
    {
        id: 2,
        title: "Palindrome Check",
        buggyCode: `text = input("Enter a string: ")\nif text == text[::-1]:\n    print("Palindrome")\nelse:\n    print("Not Palindrome")`,
        expectedInput: "madam",
        expectedOutput: "Palindrome"
    },
    {
        id: 3,
        title: "Largest of Three Numbers",
        buggyCode: `a = int(input("Enter first number: "))\nb = int(input("Enter second number: "))\nc = int(input("Enter third number: "))\nif a > b and a > c:\n    print("Largest is", a)\nelif b > a and b > c:\n    print("Largest is", b)\nelse:\n    print("Largest is", c)`,
        expectedInput: "10\n25\n15",
        expectedOutput: "Largest is 25"
    },
    {
        id: 4,
        title: "Count Vowels",
        buggyCode: `text = input("Enter a string: ")\ncount = 0\nfor char in text.lower():\n    if char in "aeiou":\n        count = count + 1\nprint("Total vowels:", count)`,
        expectedInput: "Education",
        expectedOutput: "Total vowels: 5"
    },
    {
        id: 5,
        title: "Fibonacci Series",
        buggyCode: `n = int(input("Enter number of terms: "))\na, b = 0, 1\nfor i in range(n):\n    print(a)\n    a, b = b, a + b`,
        expectedInput: "5",
        expectedOutput: "0\n1\n1\n2\n3"
    }
];

function getRandomQuestions() {
    let shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

document.addEventListener('DOMContentLoaded', async () => {
    const examQuestions = getRandomQuestions();
    let currentQuestionIndex = 0;
    let timer;
    let pyodide;

    async function initializePyodide() {
        const terminal = document.getElementById('terminal');
        terminal.innerText = "Initializing Pyodide... This may take a moment.";
        pyodide = await loadPyodide();
        terminal.innerText = "Pyodide loaded. Ready to execute Python code.";
    }

    await initializePyodide();

    function loadQuestion(index) {
        const question = examQuestions[index];
        document.getElementById('problem-title').innerText = question.title;
        document.getElementById('problem-description').innerText = "Fix the buggy code below.";
        document.getElementById('buggy-code').innerText = question.buggyCode;
        document.getElementById('editor').value = question.buggyCode;
        if (question.expectedInput) {
            const inputs = question.expectedInput.split('\n');
            let inputIndex = 0;
            pyodide.globals.set("input", (prompt) => {
                if (inputIndex < inputs.length) {
                    return inputs[inputIndex++];
                }
                return "";
            });
        }
    }

    function startTimer(duration) {
        let timeLeft = duration;
        timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById('timer').innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            if (timeLeft === 0) {
                clearInterval(timer);
                nextQuestion();
            }
            timeLeft--;
        }, 1000);
    }

    function nextQuestion() {
        clearInterval(timer);
        currentQuestionIndex++;
        if (currentQuestionIndex < examQuestions.length) {
            loadQuestion(currentQuestionIndex);
            startTimer(180);
        } else {
            alert('You have completed all questions!');
            window.location.href = 'index.html';
        }
    }

    document.getElementById('run-btn').addEventListener('click', async () => {
        const terminal = document.getElementById('terminal');
        const editorValue = document.getElementById('editor').value;
        const userEmail = sessionStorage.getItem('userEmail');

        if (!pyodide || !userEmail) {
            terminal.innerText = "Error: Pyodide not loaded or user not logged in.";
            return;
        }

        terminal.innerText = "Running code...";

        try {
            let capturedOutput = "";
            pyodide.setStdout({ 
                batched: (text) => { 
                    capturedOutput += text; 
                } 
            });

            await pyodide.runPythonAsync(editorValue);

            const currentQuestion = examQuestions[currentQuestionIndex];
            
            const normalizedCaptured = capturedOutput.replace(/\s+/g, '').trim();
            const normalizedExpected = currentQuestion.expectedOutput.replace(/\s+/g, '').trim();

            if (normalizedCaptured === normalizedExpected) {
                const userRef = doc(db, "participants", userEmail);
                
                await updateDoc(userRef, {
                    score: increment(1)
                });

                terminal.innerText = "✅ Correct! Moving to the next question.\n\n" + capturedOutput;
                setTimeout(nextQuestion, 2000); 
            } else {
                terminal.innerText = "❌ Incorrect Output. Please try again.\n\nYour output:\n" + capturedOutput;
            }
        } catch (err) {
            terminal.innerText = "⚠️ Python Error:\n" + err.message;
        } finally {
            pyodide.setStdout({});
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            const email = sessionStorage.getItem('userEmail');
            if (email) {
                const userRef = doc(db, "participants", email);
                updateDoc(userRef, {
                    violations: increment(1)
                });
            }
        }
    });

    loadQuestion(currentQuestionIndex);
    startTimer(180);
});

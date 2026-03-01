// ==========================
// GET USERS FROM STORAGE
// ==========================
let users = JSON.parse(localStorage.getItem("users")) || [];

// ==========================
// REGISTER
// ==========================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function(e){
        e.preventDefault();

        const fullname = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if(password !== confirmPassword){
            alert("Passwords do not match!");
            return;
        }

        if(users.find(user => user.email === email)){
            alert("Email already registered!");
            return;
        }

        const newUser = {
            id: Date.now(),
            fullname,
            email,
            password
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        alert("Registration successful!");
        window.location.href = "login.html";
    });
}

// ==========================
// LOGIN
// ==========================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(e){
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        const validUser = users.find(
            user => user.email === email && user.password === password
        );

        if(!validUser){
            alert("Invalid email or password!");
            return;
        }

        localStorage.setItem("currentUser", JSON.stringify(validUser));

        alert("Login successful!");
        window.location.href = "dashboard.html";
    });
}

// ==========================
// DASHBOARD PROTECTION
// ==========================
if(window.location.pathname.includes("dashboard.html")){
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if(!currentUser){
        window.location.href = "login.html";
    } else {
        const userSpan = document.getElementById("currentUserName");
        if(userSpan){
            userSpan.innerText = currentUser.fullname;
        }
    }
}

// ==========================
// LOGOUT
// ==========================
function logout(){
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

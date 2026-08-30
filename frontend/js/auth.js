const loginheader = document.querySelector(".login-header h1")
const Eregister = document.querySelector(".register")
const passwordBox = document.querySelector(".password-box");
const submitbutton = document.querySelector(".login-button");
var username = document.querySelector('input[name="username"]');
var password = document.querySelector('input[name="password"]');
var button = passwordBox.querySelector("button");
const form = document.querySelector(".login-form");
const error = document.querySelector(".error");

var isRegister = false;

async function login() {

    const data = {
        username: username.value,
        password: password.value
    };

    if (!username.value.trim() || !password.value.trim()) {
        error.innerText = "Vui lòng nhập đầy đủ trường!"
        error.style.display = "block";

        return;
    }
    error.style.display = "none";

    try {

        const response = await fetch("#", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });

        const result = await response.json();

        console.log(result);

    } catch (error) {

        console.error(error);

    }
}

async function register() {

    const confirmPassword = document.querySelector(".confirm-password");
    const passwordError = document.querySelector(".password-error");

    const data = {
        username: username.value,
        password: password.value
    };

    if (!username.value.trim() || !password.value.trim()) {
        error.innerText = "Vui lòng nhập đầy đủ trường!"
        error.style.display = "block";

        return;
    }
        error.style.display = "none";
    
    if (data.password !== confirmPassword.value) {

        passwordError.style.display = "block";
        return;
    } else {

        passwordError.style.display = "none";

    }

    try {

        const response = await fetch("#", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });

        const result = await response.json();

        console.log(result);

    } catch (error) {

        console.error(error);

    }
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (isRegister) {
        register();
    } else {
        login();
    }
});

function changemode() {
    if (!isRegister) {
        Eregister.innerHTML = `
        <span> Bạn đã có tài khoản? </span>

          <a href="#">
            Đăng nhập
          </a>
        `
        passwordBox.insertAdjacentHTML("afterend", `
        <div class="confirm-password-box">

            <input type="password" class="confirm-password" placeholder="Nhập lại mật khẩu">

            <div class="password-error">
              Mật khẩu không khớp
            </div>

          </div>
        `);
        submitbutton.innerText = "Đăng ký";
        loginheader.innerText = "Đăng ký";
        var forgotPassword = document.querySelector(".forgot-password");

        if (forgotPassword) {
            forgotPassword.remove();
        }

    } else {
        Eregister.innerHTML = `
        <span> Bạn chưa có tài khoản? </span>

          <a href="#">
            Đăng ký
          </a>
        `
        var confirmPassword = document.querySelector(".confirm-password-box");

        if (confirmPassword) {
            confirmPassword.remove();
        }
        submitbutton.innerText = "Đăng nhập";
        loginheader.innerText = "Đăng nhập";

        passwordBox.insertAdjacentHTML("afterend", `
        <a href="#" class="forgot-password">
            Quên mật khẩu?
          </a>
        `);
    }
    isRegister = !isRegister;
}

Eregister.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
        event.preventDefault();
        changemode();
    }
});



button.addEventListener("click", function () {
    if (password.type === "password") {
        password.type = "text";
        button.innerText = "Ẩn";
    } else {
        password.type = "password";
        button.innerText = "Hiện";
    }
});

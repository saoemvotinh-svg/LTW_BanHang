const loginheader = document.querySelector(".login-header h1")
const Eregister = document.querySelector(".register")
const passwordBox = document.querySelector(".password-box");
const submitbutton = document.querySelector(".login-button");
var password = document.querySelector('input[name="password"]');
var button = passwordBox.querySelector("button");

var isRegister = false;
function changemode() {
    if (!isRegister) {
        Eregister.innerHTML = `
        <span> Bạn đã có tài khoản? </span>

          <a href="#">
            Đăng nhập
          </a>
        `
        passwordBox.insertAdjacentHTML("afterend", `
        <input type="password" class="confirm-password" placeholder="Nhập lại mật khẩu">
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
        var confirmPassword = document.querySelector(".confirm-password");

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

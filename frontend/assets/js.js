const loginForm = document.querySelector(".login-form");
const registerForm = document.querySelector(".register-form");
const wrapper = document.querySelector(".wrapper");
const loginTitle = document.querySelector(".title-login");
const registerTitle = document.querySelector(".title-register");
const signUpBtn = document.querySelector("#signUpBtn");
const signInBtn = document.querySelector("#SignInBtn");
const toaster = document.querySelector(".toaster");
const body = document.querySelector(".body");

function loginFunction() {
  loginForm.style.left = "50%";
  registerForm.style.left = "150%";
  loginForm.style.opacity = 1;
  registerForm.style.opacity = 0;
  wrapper.style.height = "500px";
  loginTitle.style.top = "50%";
  registerTitle.style.top = "50px";
  loginTitle.style.opacity = "1";
  registerTitle.style.opacity = "0";
}

function registerFunction() {
  loginForm.style.left = "-50%";
  registerForm.style.left = "50%";
  loginForm.style.opacity = 0;
  registerForm.style.opacity = 1;
  wrapper.style.height = "580px";
  loginTitle.style.top = "-60px";
  registerTitle.style.top = "50%";
  loginTitle.style.opacity = "0";
  registerTitle.style.opacity = "1";
}

signInBtn.addEventListener("click", (e) => {
  toaster.classList.add("toggle");
  setTimeout(() => {
    toaster.classList.remove("toggle");
  }, 3000);
});
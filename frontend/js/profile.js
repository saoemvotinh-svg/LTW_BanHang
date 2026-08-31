import { CHECK_URL, PROFILE_URL, LOGOUT_URL } from "./configs.js";

const profileLoading  = document.querySelector(".profile-loading");
const profileContent  = document.querySelector(".profile-content");
const profileError    = document.querySelector(".profile-error");

const elFullName     = document.querySelector(".profile-header-info .profile-fullname");
const elFullNameInfo = document.querySelector(".profile-info-grid .profile-fullname");
const elEmail     = document.querySelector(".profile-email");
const elPhone     = document.querySelector(".profile-phone");
const elAddress   = document.querySelector(".profile-address");
const elRole      = document.querySelector(".profile-role");
const elCreatedAt = document.querySelector(".profile-created-at");

const editBtn    = document.querySelector(".profile-edit-btn");
const logoutBtn  = document.querySelector(".profile-logout-btn");

const editForm       = document.querySelector(".profile-edit-form");
const inputFullName  = document.querySelector('input[name="full_name"]');
const inputPhone     = document.querySelector('input[name="phone"]');
const inputAddress   = document.querySelector('textarea[name="address"]');
const saveBtn        = document.querySelector(".profile-save-btn");
const cancelBtn      = document.querySelector(".profile-cancel-btn");
const editError      = document.querySelector(".edit-error");
const editSuccess    = document.querySelector(".edit-success");


/*
|--------------------------------------------------------------------------
| LẤY HEADER XÁC THỰC
|--------------------------------------------------------------------------
*/

function getAuthHeaders() {

    const token = localStorage.getItem('auth_token');

    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    return headers;

}


/*
|--------------------------------------------------------------------------
| LOAD PROFILE
|--------------------------------------------------------------------------
*/

async function loadProfile() {

    try {

        const response = await fetch(CHECK_URL, {
            method: "GET",
            credentials: "include",
            headers: getAuthHeaders()
        });

        // Kiểm tra HTTP response hợp lệ trước
        if (!response.ok && response.status !== 200) {
            profileLoading.style.display = "none";
            profileError.style.display   = "block";
            return;
        }

        const result = await response.json();

        // Chưa đăng nhập → xóa storage và chuyển sang login
        if (result.logged_in === false) {

            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');

            window.location.href = "login.html";

            return;

        }

        // Lỗi khác (server error) → hiện thông báo lỗi, không redirect
        if (!result.success) {

            profileLoading.style.display = "none";
            profileError.style.display   = "block";
            return;

        }

        const user = result.user;

        elFullName.innerText     = user.full_name || "—";
        elFullNameInfo.innerText = user.full_name || "—";
        elEmail.innerText        = user.email     || "—";
        elPhone.innerText        = user.phone     || "—";
        elAddress.innerText      = user.address   || "—";
        elRole.innerText         = user.role === "admin" ? "Quản trị viên" : "Khách hàng";

        // Lấy thêm created_at từ profile API
        await loadCreatedAt();

        profileLoading.style.display = "none";
        profileContent.style.display = "block";

    } catch (err) {

        // Lỗi mạng (backend chưa chạy, sai port...) → hiện lỗi, KHÔNG redirect
        console.error("[profile] Lỗi kết nối:", err);

        profileLoading.style.display = "none";
        profileError.style.display   = "block";

    }
}


async function loadCreatedAt() {

    try {

        const response = await fetch(PROFILE_URL, {
            method: "GET",
            credentials: "include",
            headers: getAuthHeaders()
        });

        const result = await response.json();

        if (result.success && result.user.created_at) {

            const date = new Date(result.user.created_at);

            elCreatedAt.innerText = date.toLocaleDateString("vi-VN", {
                day:   "2-digit",
                month: "2-digit",
                year:  "numeric"
            });

        }

    } catch (err) {

        console.error(err);

    }
}


/*
|--------------------------------------------------------------------------
| MỞ FORM CHỈNH SỬA
|--------------------------------------------------------------------------
*/

editBtn.addEventListener("click", function () {

    inputFullName.value  = elFullName.innerText !== "—" ? elFullName.innerText : "";
    inputPhone.value     = elPhone.innerText    !== "—" ? elPhone.innerText    : "";
    inputAddress.value   = elAddress.innerText  !== "—" ? elAddress.innerText  : "";

    editError.style.display   = "none";
    editSuccess.style.display = "none";

    editForm.style.display    = "block";
    editBtn.style.display     = "none";

});


/*
|--------------------------------------------------------------------------
| HỦY CHỈNH SỬA
|--------------------------------------------------------------------------
*/

cancelBtn.addEventListener("click", function () {

    editForm.style.display = "none";
    editBtn.style.display  = "inline-block";

});


/*
|--------------------------------------------------------------------------
| LƯU PROFILE
|--------------------------------------------------------------------------
*/

saveBtn.addEventListener("click", async function () {

    const data = {
        full_name: inputFullName.value.trim(),
        phone:     inputPhone.value.trim(),
        address:   inputAddress.value.trim()
    };

    if (!data.full_name) {
        editError.innerText       = "Vui lòng nhập họ và tên";
        editError.style.display   = "block";
        editSuccess.style.display = "none";
        return;
    }

    editError.style.display   = "none";
    editSuccess.style.display = "none";

    saveBtn.disabled    = true;
    saveBtn.innerText   = "Đang lưu...";

    try {

        const response = await fetch(PROFILE_URL, {
            method: "POST",

            headers: getAuthHeaders(),

            credentials: "include",

            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {

            elFullName.innerText = data.full_name;
            elPhone.innerText    = data.phone    || "—";
            elAddress.innerText  = data.address  || "—";

            editSuccess.innerText       = result.message;
            editSuccess.style.display   = "block";

            setTimeout(function () {
                editForm.style.display = "none";
                editBtn.style.display  = "inline-block";
                editSuccess.style.display = "none";
            }, 1500);

        } else {

            editError.innerText     = result.message;
            editError.style.display = "block";

        }

    } catch (err) {

        console.error(err);

        editError.innerText     = "Lỗi kết nối máy chủ";
        editError.style.display = "block";

    } finally {

        saveBtn.disabled  = false;
        saveBtn.innerText = "Lưu thay đổi";

    }

});


/*
|--------------------------------------------------------------------------
| ĐĂNG XUẤT
|--------------------------------------------------------------------------
*/

logoutBtn.addEventListener("click", async function () {

    try {

        await fetch(LOGOUT_URL, {
            method: "POST",
            credentials: "include",
            headers: getAuthHeaders()
        });

    } catch (err) {

        console.error(err);

    } finally {

        // Xóa token khỏi localStorage khi đăng xuất
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        window.location.href = "login.html";

    }

});


/*
|--------------------------------------------------------------------------
| KHỞI ĐỘNG
|--------------------------------------------------------------------------
*/

loadProfile();

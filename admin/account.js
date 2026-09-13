// ========================================
// ADMIN PROFILE
// ========================================

function loadAdminProfile() {

    const profile =
        window.adminProfile;

    if (!profile) return;


    setValue(
        "adminProfileName",
        profile.full_name
    );

    setValue(
        "adminProfilePhone",
        profile.phone
    );

    setValue(
        "adminProfileEmail",
        profile.email
    );

}


async function saveAdminProfile() {

    const fullName =
        getFieldValue("adminProfileName");

    const phone =
        getFieldValue("adminProfilePhone");


    const message =
        document.getElementById(
            "profileSaveMessage"
        );


    const { error } =
        await window.adminAuthClient
            .from("profiles")
            .update({
                full_name: fullName,
                phone: phone
            })
            .eq(
                "id",
                window.adminProfile.id
            );


    if (!message) return;


    if (error) {

        message.textContent =
            "Could not save your profile. Please try again.";

        message.className =
            "form-message error";

        return;

    }


    window.adminProfile.full_name = fullName;
    window.adminProfile.phone = phone;


    message.textContent =
        "Profile saved.";

    message.className =
        "form-message success";


    renderAdminIdentity(window.adminProfile);

}


// ========================================
// ACCOUNT SECURITY
// ========================================

function showPasswordChangeMessage(message, type) {

    const element =
        document.getElementById(
            "passwordChangeMessage"
        );

    if (!element) return;


    element.textContent = message;

    element.className =
        `form-message ${type}`;

}


async function changeAdminPassword() {

    const newPassword =
        getFieldValue("settingNewPassword");

    const confirmPassword =
        getFieldValue("settingConfirmPassword");


    if (newPassword.length < 6) {

        showPasswordChangeMessage(
            "Password must be at least 6 characters.",
            "error"
        );

        return;

    }


    if (newPassword !== confirmPassword) {

        showPasswordChangeMessage(
            "Passwords do not match.",
            "error"
        );

        return;

    }


    const { error } =
        await window.adminAuthClient.auth.updateUser({
            password: newPassword
        });


    if (error) {

        showPasswordChangeMessage(
            "Could not update password. Please try again.",
            "error"
        );

        return;

    }


    document.getElementById("settingNewPassword").value = "";

    document.getElementById("settingConfirmPassword").value = "";


    showPasswordChangeMessage(
        "Password updated.",
        "success"
    );

}


// ========================================
// INITIALIZE
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    initAdminPage(loadAdminProfile);

});

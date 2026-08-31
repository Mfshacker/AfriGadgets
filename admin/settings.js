// ========================================
// SETTINGS
// ========================================

const DEFAULT_SETTINGS = {

    bankName: "YOUR BANK NAME",
    accountHolder: "AFRIGADGETS",
    accountNumber: "0000000000",
    accountType: "Current / Cheque",
    payShap: "+27 XX XXX XXXX",

    deliveryFee: 99,

    storeName: "AfriGadgets",
    phone: "+27 XX XXX XXXX",
    email: "support@afrigadgets.co.za",

    paymentInstructions:
        "Please complete your bank transfer using the details provided and use your generated payment reference."

};


let cachedAdminSettings = null;


function mapSettingsRow(row) {

    return {
        bankName: row.bank_name,
        accountHolder: row.account_holder,
        accountNumber: row.account_number,
        accountType: row.account_type,
        payShap: row.payshap,
        deliveryFee: Number(row.delivery_fee),
        storeName: row.store_name,
        phone: row.phone,
        email: row.email,
        paymentInstructions: row.payment_instructions
    };

}


async function fetchAdminSettings() {

    const { data, error } =
        await window.adminAuthClient
            .from("store_settings")
            .select("*")
            .single();

    cachedAdminSettings =
        error || !data
        ? { ...DEFAULT_SETTINGS }
        : mapSettingsRow(data);

    return cachedAdminSettings;

}


function getSettings() {

    return cachedAdminSettings || { ...DEFAULT_SETTINGS };

}


async function updateAdminSettings(patch) {

    const columnMap = {
        bankName: "bank_name",
        accountHolder: "account_holder",
        accountNumber: "account_number",
        accountType: "account_type",
        payShap: "payshap",
        deliveryFee: "delivery_fee",
        storeName: "store_name",
        phone: "phone",
        email: "email",
        paymentInstructions: "payment_instructions"
    };

    const dbPatch = {};

    Object.entries(patch).forEach(([key, value]) => {
        dbPatch[columnMap[key]] = value;
    });

    const { error } =
        await window.adminAuthClient
            .from("store_settings")
            .update(dbPatch)
            .eq("id", true);

    if (!error) {

        cachedAdminSettings = {
            ...getSettings(),
            ...patch
        };

    }

    return error;

}


async function loadSettingsIntoAdmin() {

    await fetchAdminSettings();

    const settings =
        getSettings();


    setValue(
        "settingBankName",
        settings.bankName
    );

    setValue(
        "settingAccountHolder",
        settings.accountHolder
    );

    setValue(
        "settingAccountNumber",
        settings.accountNumber
    );

    setValue(
        "settingAccountType",
        settings.accountType
    );

    setValue(
        "settingPayShap",
        settings.payShap
    );

    setValue(
        "settingDeliveryFee",
        settings.deliveryFee
    );

    setValue(
        "settingStoreName",
        settings.storeName
    );

    setValue(
        "settingPhone",
        settings.phone
    );

    setValue(
        "settingEmail",
        settings.email
    );

    setValue(
        "settingPaymentInstructions",
        settings.paymentInstructions
    );

}


async function saveBankSettings() {

    const error =
        await updateAdminSettings({

            bankName:
                getFieldValue("settingBankName"),

            accountHolder:
                getFieldValue("settingAccountHolder"),

            accountNumber:
                getFieldValue("settingAccountNumber"),

            accountType:
                getFieldValue("settingAccountType"),

            payShap:
                getFieldValue("settingPayShap")

        });


    alert(
        error
        ? "Could not save bank details. Please try again."
        : "Bank details saved."
    );

}


async function saveDeliverySettings() {

    const error =
        await updateAdminSettings({

            deliveryFee:
                Number(
                    getFieldValue(
                        "settingDeliveryFee"
                    )
                ) || 0

        });


    alert(
        error
        ? "Could not save delivery settings. Please try again."
        : "Delivery settings saved."
    );

}


async function saveStoreSettings() {

    const error =
        await updateAdminSettings({

            storeName:
                getFieldValue("settingStoreName"),

            phone:
                getFieldValue("settingPhone"),

            email:
                getFieldValue("settingEmail")

        });


    alert(
        error
        ? "Could not save store information. Please try again."
        : "Store information saved."
    );

}


async function saveCheckoutSettings() {

    const error =
        await updateAdminSettings({

            paymentInstructions:
                getFieldValue(
                    "settingPaymentInstructions"
                )

        });


    alert(
        error
        ? "Could not save checkout settings. Please try again."
        : "Checkout settings saved."
    );

}


// ========================================
// INITIALIZE
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    initAdminPage(loadSettingsIntoAdmin);

});

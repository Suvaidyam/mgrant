const validate_url_regex = (url) => {
    const regex = /^(http|https):\/\/[^ "]+$/;
    if (regex.test(url)) {
        frappe.validated = true;
    } else {
        frappe.msgprint(__("Invalid URL"));
        frappe.validated = false;
    }
};

function validate_ifsc(ifsc) {
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscPattern.test(ifsc)) {
        frappe.msgprint(__("Invalid IFSC Code"));
        frappe.validated = false;
    } else {
        frappe.validated = true;
    }
}

const validate_indian_phone_number_regex = (phone) => {
    const regex = /^[6-9]\d{9}$/;
    if (regex.test(phone)) {
        frappe.validated = true;
    } else {
        frappe.msgprint(__("Invalid Phone Number"));
        frappe.validated = false;
    }
}

const validate_indian_pan_number = (pan) => {
    const regex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
    if (regex.test(pan)) {
        frappe.validated = true;
    } else {
        frappe.msgprint(__("Invalid PAN Number Format"));
        frappe.validated = false;
    }
}
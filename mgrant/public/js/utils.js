const hide_print_button = (frm) => {
    if (frm.is_new()) {
        frm.page.wrapper.find('.btn[data-original-title="Print"], .dropdown-menu [data-label="Print"]').parent().hide()
    } else {
        frm.page.wrapper.find('.btn[data-original-title="Print"], .dropdown-menu [data-label="Print"]').parent().show()
    }
}

function callAPI(options) {
    return new Promise((resolve, reject) => {
        frappe.call({
            ...options,
            callback: async function (response) {
                resolve(response?.message || response?.value)
            }
        });
    })
}

async function validate_date(d1, op, d2, msg) {
    if (d1 && d2) {
        if (eval(`new Date(d1) ${op} new Date(d2)`)) frappe.throw({ message: msg, indicator: 'red' });
    }
}
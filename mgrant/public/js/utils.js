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
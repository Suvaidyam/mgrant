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

const getPermissions = async (doctype) => {
    let res = await frappe.call({
        method: 'frappe_theme.api.get_permissions',
        args: { doctype },
        callback: function (response) {
            return response.message
        },
        error: (err) => {
            console.error(err);
        }
    });
    return res?.message ?? [];
}
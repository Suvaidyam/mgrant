const getDocList = (doctype, filters, fields = ['*']) => {
    return new Promise((resolve, reject) => {
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype,
                filters,
                fields,
                order_by: 'creation desc'
            },
            callback: function (response) {
                resolve(response.message);
            },
            error: (err) => {
                reject(err)
            }
        });
    })
}

async function set_value(doctype_name, name) {
    frappe.call({
        "method": "frappe.client.set_value",
        "args": {
            "doctype": doctype_name,
            "name": name,
            "fieldname": {
                "seen": 1
            },
        }
    });
}
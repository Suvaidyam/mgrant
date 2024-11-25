// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt

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

const getViewSettings = (doctype) => {
    return new Promise((resolve, reject) => {
        frappe.call({
            method: "frappe_theme.api.get_my_list_settings",
            args: { doctype: doctype },
            callback: function (response) {
                if (response.message) {
                    resolve(response.message);
                } else {
                    reject(new Error('No message returned from server.'));
                }
            },
            error: (err) => {
                console.error('Permission error:', err);
                reject(new Error('You do not have permission to access this resource.'));
            }
        });
    });
}

const tabContent = async (frm, tab_field) => {
    if (tab_field === 'gallery_tab') {
        gallery_image(frm);
    }
    if (tab_field === 'email_tab') {
        cominucation(frm);
    }
    if (tab_field === 'tasks_tab') {
        getTaskList(frm)
    }
}

frappe.ui.form.on("Proposal", {
    refresh(frm) {
        let tab_field = frm.get_active_tab()?.df?.fieldname;
        tabContent(frm, tab_field)
        $('a[data-toggle="tab"]').on('shown.bs.tab', async function (e) {
            let tab_field = frm.get_active_tab()?.df?.fieldname;
            tabContent(frm, tab_field)
        });
    },
});

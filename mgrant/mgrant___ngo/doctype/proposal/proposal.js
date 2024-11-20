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

const tabContent = async (frm, tab_field) => {
    let field = frm.meta?.fields?.find(f => f.fieldname == tab_field)
    let _fields = frm.meta?.fields?.filter(f => field?.default?.split(',')?.includes(f.fieldname))
    if (tab_field === 'gallery_tab') {
        gallery_image(frm);
    }
    if (tab_field === 'email_tab') {
        cominucation(frm);
    }
    for (let _f of _fields) {
        let link = frm.meta.links?.find(f => f.link_doctype == _f.default)
        if (link) {
            new SvaDataTable({
                wrapper: document.querySelector(`#${_f.fieldname}`), // Wrapper element   // Pass your data
                doctype: link.link_doctype, // Doctype name
                crud: true,      // Enable CRUD operations (optional)
                frm: frm,       // Pass the current form object (optional)
                options: {
                    connection: link,
                    serialNumberColumn: true, // Enable serial number column (optional)
                    editable: false,      // Enable editing (optional),
                }
            });
        }
        if (_f.default === 'tasks') {
            getTaskList(_f, frm)
        }
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
        // if (!frm.doc.__unsave && frm.doc.stages == "Grant Letter Signed") {
        //     frm.disable_form();
        // }
    },
});

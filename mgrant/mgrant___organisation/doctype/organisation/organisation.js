// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt


const getDocList = (doctype, filters, fields=['*'])=>{
    return new Promise((resolve, reject)=>{
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype,
                filters,
                fields,
                order_by: 'creation desc'
            },
            callback: function(response) {
                resolve(response.message);
            },
            error:(err)=>{
                reject(err)
            }
        });
    })
}

const getViewSettings = (doctype) => {
    return new Promise((resolve, reject) => {
        frappe.call({
            method: "frappe_theme.api.get_my_list_settings",
            args: { doctype: doctype},
            callback: function(response) {
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

const tabContent = async(frm, tab_field)=>{
    let field = frm.meta?.fields?.find(f=> f.fieldname == tab_field)
    let _fields = frm.meta?.fields?.filter(f=> field?.default?.split(',')?.includes(f.fieldname))
    for(let _f of _fields){
        let link = frm.meta.links?.find(f=> f.link_doctype == _f.default)
        if(link){
            let settings = await getViewSettings(link.link_doctype);
            if(settings?.fields){
                let fields = JSON.parse(settings.fields)?.map(e=> e.fieldname);;
                let columns = await frappe.call('frappe_theme.api.get_meta_fields', { doctype: link.link_doctype });
                let _columns = [{
                    fieldname:'name',
                    label:'ID'
                },...columns?.message?.filter(f=> fields.includes(f.fieldname))]
                
                let rows = await getDocList(link.link_doctype,[
                    [link.link_doctype, link.link_fieldname,'=', frm.doc.name]
                ], ['*'])

                let datatable = new SvaDataTable({
                    wrapper:document.querySelector(`#${_f.fieldname}`), // Wrapper element
                    columns: _columns,   // Define columns
                    rows: rows,      // Pass your data
                    doctype: link.link_doctype, // Doctype name
                    crud: ['Project','Proposal'].includes(link.link_doctype) ? false : true,      // Enable CRUD operations (optional)
                    frm: frm,       // Pass the current form object (optional)
                    options:{
                        serialNumberColumn: true, // Enable serial number column (optional)
                        editable: false,      // Enable editing (optional),
                    }
                });
            }
        }
    }
}

frappe.ui.form.on("Organisation", {
	refresh(frm) {
        let tab_field = frm.get_active_tab()?.df?.fieldname;
        tabContent(frm, tab_field)
        $('a[data-toggle="tab"]').on('shown.bs.tab', async function (e) {
            let tab_field = frm.get_active_tab()?.df?.fieldname;
            tabContent(frm, tab_field)
        });
	},
});

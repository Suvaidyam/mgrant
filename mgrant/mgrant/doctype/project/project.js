// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt
const getDocList = (doctype, filters, fields=['*'])=>{
    return new Promise((resolve, reject)=>{
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype,
                filters,
                fields
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
const getViewSettings = (doctype)=>{
    return new Promise((resolve, reject)=>{
        frappe.call({
            method: "frappe.desk.listview.get_list_settings",
            args: {doctype: doctype},
            callback: function(response) {
                resolve(response.message)
            },
            error:(err)=>{
                reject(err)
            }
        });
    });
}
frappe.ui.form.on("Project", {
	async refresh(frm) {
        $('a[data-toggle="tab"]').on('shown.bs.tab', async function (e) {
            let target = $(e.target).attr("data-fieldname");
            let field = frm.meta?.fields?.find(f=> f.fieldname == target)
            let _fields = frm.meta?.fields?.filter(f=> field?.default?.split(',')?.includes(f.fieldname))
            for(let _f of _fields){
                let link = frm.meta.links?.find(f=> f.link_doctype == _f.default)
                if(link){
                    let settings = await getViewSettings(link.link_doctype);
                    if(settings?.fields){
                        let fields = JSON.parse(settings.fields);
                        let columns = fields?.map(el=>{return {id:el.fieldname, name:el.label,editable: false, width:100}})

                        let rows = await getDocList(link.link_doctype,[
                            [link.link_doctype, link.link_fieldname,'=', frm.doc.name]
                        ], columns.map(e=> e.id))
                        let datatable = new frappe.DataTable(`#${_f.fieldname}`, {
                            columns: columns,   // Define columns
                            data: rows,         // Pass your data
                            inlineFilters: true,  // Enable filters
                            layout: 'fluid',      // Fluid layout
                            height: 500        // Set table height (optional)
                        });
                        console.log("data:",fields,rows);
                    }
                }
            }
        });
	},
});

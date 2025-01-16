// frappe.listview_settings['NGO'] = {
//     onload: function(listview) {
//         listview.page.add_inner_button(__("Import NGOs From Central Repository"), async function() {
//             let res = await frappe.call({
//                 method:"mgrant.apis.ngo.ngo.sync_ngos_from_central_repo",
//             })
//             if (res.message && res.message.length) {
//                 let fields = []
//                 res.message.forEach(ngo => {
//                     fields.push({
//                         "fieldname": ngo.name,
//                         "label": ngo.ngo_name,
//                         "fieldtype": "Check",
//                         "default": 0
//                     })
//                 });
//                 let dialog = new frappe.ui.Dialog({
//                     title: __("Select Donors to Import"),
//                     fields: fields,
//                     primary_action_label: __("Import"),
//                     primary_action: async function(values) {
//                         let ngos = []
//                         for(ngo_id of Object.keys(values)) {
//                             if(values[ngo_id]) {
//                                 let ngo = res.message.find(d => d.name === ngo_id);
//                                 ngos.push(ngo);
//                             }
//                         }
//                         if (ngos.length > 0){
//                             let response = await frappe.call({
//                                 method: "mgrant.apis.ngo.ngo.sync_selected_ngos_from_central_repo",
//                                 args: {
//                                     ngos: ngos
//                                 }
//                             });
//                             frappe.msgprint(response.message);
//                         }
//                         dialog.hide();
//                         listview.refresh();
//                     },
//                     secondary_action_label: __("Cancel"),
//                     secondary_action: function() {
//                         dialog.hide();
//                     }
//                 });
//                 dialog.show();
//             }
//         });
//     },
// };
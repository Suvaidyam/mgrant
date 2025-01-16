// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt

// frappe.listview_settings['Donor'] = {
//     onload: function(listview) {
//         listview.page.add_inner_button(__("Import Donors From Central Repository"), async function() {
//             let res = await frappe.call({
//                 method:"mgrant.apis.ngo.donor.sync_donors_from_central_repo",
//             })
//             if (res.message && res.message.length) {
//                 let fields = []
//                 res.message.forEach(donor => {
//                     fields.push({
//                         "fieldname": donor.name,
//                         "label": donor.donor_name,
//                         "fieldtype": "Check",
//                         "default": 0
//                     })
//                 });
//                 let dialog = new frappe.ui.Dialog({
//                     title: __("Select Donors to Import"),
//                     fields: fields,
//                     primary_action_label: __("Import"),
//                     primary_action: async function(values) {
//                         let donors = []
//                         for(donor_id of Object.keys(values)) {
//                             if(values[donor_id]) {
//                                 let donor = res.message.find(d => d.name === donor_id);
//                                 donors.push(donor);
//                             }
//                         }
//                         if (donors.length > 0){
//                             let response = await frappe.call({
//                                 method: "mgrant.apis.ngo.donor.sync_selected_donors_from_central_repo",
//                                 args: {
//                                     donors: donors
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
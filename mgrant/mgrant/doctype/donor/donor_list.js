// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt

frappe.listview_settings['Donor'] = {
    onload: function(listview) {
        listview.page.add_inner_button(__("Sync Donors From Central Repository"), async function() {
            let res = await frappe.call({
                method:"mgrant.apis.ngo.donor.sync_donors_from_central_repo",
            })
            console.log(res,'res')
        });
    },
};
frappe.db.get_doc('mGrant Settings','mGrant Settings').then(doc => {
    frappe.mgrant_settings = doc;
});
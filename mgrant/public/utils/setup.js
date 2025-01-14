frappe.db.get_doc('mGrant Settings','mGrant Settings').then(doc => {
    frappe.mgrant_settings = doc;
});

frappe.get_bank_with_ifsc = async (IFSC) => {
    try {
        const response = await fetch(`https://ifsc.razorpay.com/${IFSC}`, {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error(response);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
};
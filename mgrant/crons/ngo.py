import frappe
from frappe.utils import today

def mark_ngo_dd_expired():
    ngo_expirable_dds = frappe.get_list("NGO Due Diligence", filters={"status":"Active","due_diligence_validation":['<',today()]}, fields=['name','ngo'], limit=1000, ignore_permissions=True)
    ddfr = frappe.get_list("DDFR", filters={"name":["IN",["Other","Others"]]}, pluck='name', limit=1000, ignore_permissions=True)
    if len(ngo_expirable_dds):
        for ngo_dd in ngo_expirable_dds:
            frappe.db.set_value("NGO Due Diligence", ngo_dd.name, "status", "Expired", update_modified=False)
            ngo_doc = frappe.get_doc("NGO", ngo_dd.ngo)
            ngo_doc.is_due_diligence_cleared = "No"
            if len(ddfr):
                ngo_doc.append("reasons", {
                    "reason": ddfr[0] if len(ddfr) else "Other",
                })
                ngo_doc.reason_for_due_diligence_fail = "Due diligence validation date has expired."
            ngo_doc.save(ignore_permissions=True)
        frappe.db.commit()
    return len(ngo_expirable_dds)
import frappe
from mgrant.utils import get_positive_state_closure

def ngo_dd_on_validate(self):
    positive_closure = get_positive_state_closure(self.doctype)
    if self.workflow_state == positive_closure:
        self.status = "Active"
        
def ngo_dd_on_update(self):
    positive_closure = get_positive_state_closure(self.doctype)
    if self.workflow_state == positive_closure:
        if self.ngo:
            ngo_dds = frappe.get_list("NGO Due Diligence", filters={"ngo": self.ngo,'name':['!=',self.name],"status":["NOT IN",["Inactive","Expired"]]},pluck='name',limit=1000,ignore_permissions=True)
            for ngo_dd in ngo_dds:
                frappe.db.set_value("NGO Due Diligence", ngo_dd, "status", "Inactive",update_modified=False)
            ngo_doc = frappe.get_doc("NGO", self.ngo)
            ngo_doc.is_due_diligence_cleared = "Yes"
            ngo_doc.due_diligence_validation = self.due_diligence_validation
            ngo_doc.reasons = []
            ngo_doc.reason_for_due_diligence_fail = ""
            ngo_doc.save(ignore_permissions=True)
            
            
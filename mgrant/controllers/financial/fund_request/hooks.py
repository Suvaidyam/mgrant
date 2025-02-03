import frappe
from mgrant.utils import get_state_closure
def validate(self):
    if self.requested_amount and self.approved_amount:
        if self.approved_amount > self.requested_amount:
            frappe.throw("Approved Amount cannot be greater than Requested Amount")
    pass
def after_save(self):
    print("Fund Request Saved", self.doctype)
    pass
def on_update(self):
    state_status = get_state_closure(self.doctype, self.workflow_state)
    if state_status == "Positive":
        if frappe.db.exists("Fund Disbursement", {"fund_request": self.name}):
            frappe.throw("Fund Disbursement already created for this Fund Request")
        _doc = frappe.new_doc("Fund Disbursement")
        _doc.fund_request = self.name
        _doc.grant = self.grant
        _doc.disbursed_amount = self.approved_amount
        _doc.description = f"Disbursement of Fund ({self.description})"
        _doc.as_on_date = frappe.utils.now_datetime()
        _doc.insert()
    pass
def on_trash(self):
    print("Fund Request Deleted", self.name)
    pass
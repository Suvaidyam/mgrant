import frappe
from mgrant.utils import get_state_closure, get_positive_state_closure

def validate(self):
    if self.request_date:
        dt = frappe.utils.getdate(self.request_date)
        mgrant_settings = frappe.get_doc("mGrant Settings")
        if frappe.db.exists("mGrant Settings Grant Wise", self.grant):
            mgrant_settings = frappe.get_doc("mGrant Settings Grant Wise", self.grant)
        if mgrant_settings.get('year_type') == "Financial Year":
            if dt.month < 4:
                self.financial_year = f"FY-{dt.year-1}"
            else:
                self.financial_year = f"FY-{dt.year}"
        else:
            self.financial_year = f"FY-{dt.year}"
            
    if self.requested_amount and self.approved_amount:
        if self.approved_amount > self.requested_amount:
            frappe.throw("Approved Amount cannot be greater than Requested Amount")

def after_save(self):
    print("Fund Request Saved", self.doctype)

def on_update(self):
    positive_state = get_positive_state_closure(self.doctype)
    requests = frappe.get_list("Fund Request", filters={"grant": self.grant,"workflow_state":positive_state}, pluck="requested_amount",limit=10000,ignore_permissions=True)
    total_requested_amount = float(sum(requests) or 0)
    
    # Update total amount requested in the Grant document
    if self.grant:
        frappe.db.set_value("Grant", self.grant, "total_amount_requested_from_donor", total_requested_amount)
    
    # Check if workflow state is positive and create a Fund Disbursement if not already created
    state_status = get_state_closure(self.doctype, self.workflow_state)
    if state_status == "Positive":
        if frappe.db.exists("Fund Disbursement", {"fund_request": self.name}):
            frappe.throw("Fund Disbursement already created for this Fund Request")
            
        # Create new Fund Disbursement document
        _doc = frappe.new_doc("Fund Disbursement")
        _doc.fund_request = self.name
        _doc.grant = self.grant
        _doc.disbursed_amount = self.approved_amount
        _doc.description = f"Disbursement of Fund ({self.description})"
        _doc.as_on_date = frappe.utils.now_datetime()
        _doc.insert()

def on_trash(self):
    positive_state = get_positive_state_closure(self.doctype)
    if self.workflow_state == positive_state:
        return frappe.throw(f"Cannot delete Fund Request in {positive_state} state")
        
    requests = frappe.get_list("Fund Request", filters={"grant": self.grant,"name":['!=',self.name],"workflow_state":positive_state}, pluck="requested_amount",limit=10000,ignore_permissions=True)
    total_requested_amount = float(sum(requests) or 0)
    
    if self.grant:
        frappe.db.set_value("Grant", self.grant, "total_amount_requested_from_donor", total_requested_amount)
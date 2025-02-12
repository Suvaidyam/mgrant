import frappe
from mgrant.utils import get_state_closure, get_positive_state_closure
from frappe.utils import today

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
    request_validation(self)
    positive_state = get_positive_state_closure(self.doctype)
    requests = frappe.get_list("Fund Request", filters={"grant": self.grant,"workflow_state":positive_state}, pluck="requested_amount",limit=10000,ignore_permissions=True)
    total_requested_amount = float(sum(requests) or 0)
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
    requests = frappe.get_list("Fund Request", filters={"grant": self.grant,"name":['!=',self.name],"workflow_state":positive_state}, pluck="requested_amount",limit=10000,ignore_permissions=True)
    total_requested_amount = float(sum(requests) or 0)
    if self.grant:
        frappe.db.set_value("Grant", self.grant, "total_amount_requested_from_donor", total_requested_amount)
        
def request_validation(self):
    gr_positive_state = get_positive_state_closure("Grant Receipts")
    fr_positive_state = get_positive_state_closure(self.doctype)
    if self.grant:
        planned_tranches = frappe.get_list("Grant Receipts", filters={"grant": self.grant,"workflow_state":gr_positive_state,"planned_due_date":["<=",today()]}, pluck="total_funds_planned",limit=10000,ignore_permissions=True)
        disbs = frappe.get_list("Fund Disbursement", filters={"grant": self.grant}, pluck="disbursed_amount",limit=10000,ignore_permissions=True)
        total_funds_planned = float(sum(planned_tranches) or 0)
        total_disbursements = float(sum(disbs) or 0)
        remained_disbursements = total_funds_planned - total_disbursements
        if self.workflow_state == fr_positive_state:
            if self.approved_amount > remained_disbursements:
                frappe.throw(f"Approved Amount cannot be greater than ({remained_disbursements}).")
        else:
            if self.requested_amount > remained_disbursements:
                frappe.throw(f"Requested Amount cannot be greater than ({remained_disbursements}).")
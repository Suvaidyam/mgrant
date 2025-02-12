import frappe
from mgrant.utils import get_positive_state_closure

def grant_reciept_on_validate(self):
    if self.planned_due_date:
        dt = frappe.utils.getdate(self.planned_due_date)
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
        
def grant_reciept_on_update(self):
    positive_state = get_positive_state_closure(self.doctype)
    if self.grant:
        validate_grant_reciept(self)
        grant_doc = frappe.get_doc('Grant', self.grant)
        tranches = frappe.db.get_list('Grant Receipts', filters={'grant': self.grant,"workflow_state":positive_state}, fields=['name', 'funds_requested','total_funds_received'],limit_page_length=1000,ignore_permissions=True)
        total_funds_received = float(0)
        if len(tranches) > 0:
            for tranche in tranches:
                total_funds_received += float(tranche.total_funds_received or 0)
        grant_doc.total_funds_received = total_funds_received
        grant_doc.flags.ignore_mandatory = True
        grant_doc.save(ignore_permissions=True)
    if self.total_funds_received and self.funds_requested:
        if float(self.total_funds_received) < float(self.funds_requested):
            frappe.throw("Total Funds Planned can't be greater than Funds Requested")

def grant_reciept_on_trash(self):
    positive_state = get_positive_state_closure(self.doctype)
    if self.grant:
        grant_doc = frappe.get_doc('Grant', self.grant)
        tranches = frappe.db.get_list('Grant Receipts', filters={'grant': self.grant, 'name': ['!=', self.name],"workflow_state":positive_state}, fields=['name', 'funds_requested','total_funds_received'],limit_page_length=1000,ignore_permissions=True)
        total_funds_received = float(0)
        if len(tranches) > 0:
            for tranche in tranches:
                total_funds_received += float(tranche.total_funds_received or 0)
        grant_doc.total_funds_received = total_funds_received
        grant_doc.flags.ignore_mandatory = True
        grant_doc.save(ignore_permissions=True)
        
def validate_grant_reciept(self):
    bp_positive_state = get_positive_state_closure("Budget Plan and Utilisation")
    gr_positive_state = get_positive_state_closure(self.doctype)
    if self.grant:
        budgets = frappe.get_list("Budget Plan and Utilisation", filters={"grant": self.grant,"workflow_state":bp_positive_state}, pluck="total_planned_budget",limit=10000,ignore_permissions=True)
        grant_reciepts = frappe.get_list("Grant Receipts", filters={"grant": self.grant,"workflow_state":gr_positive_state}, pluck="total_funds_planned",limit=10000,ignore_permissions=True)
        total_funds_planned = float(sum(grant_reciepts) or 0)
        total_planned_budget = float(sum(budgets) or 0)
        if total_funds_planned > total_planned_budget:
            return frappe.throw("Total funds planned should be less than or equal to total planned budget")
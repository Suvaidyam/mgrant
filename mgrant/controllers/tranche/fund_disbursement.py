import frappe
from mgrant.utils import get_positive_state_closure

def fund_disbursement_on_validate(self):
    if self.as_on_date:
        dt = frappe.utils.getdate(self.as_on_date)
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

def fund_disbursement_on_update(self):
    positive_state = get_positive_state_closure(self.doctype)
    if self.grant:
        disbursements = frappe.get_list("Fund Disbursement", filters={"grant": self.grant,"workflow_state":positive_state}, pluck="disbursed_amount",limit=10000,ignore_permissions=True)
        total_disbursed_amount = float(sum(disbursements) or 0)
        frappe.db.set_value("Grant", self.grant, "total_funds_received", total_disbursed_amount,update_modified=False)
        
def fund_disbursement_on_trash(self):
    pass
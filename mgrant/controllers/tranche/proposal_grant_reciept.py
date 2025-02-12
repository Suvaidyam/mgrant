import frappe
def proposal_grant_on_validate(self):
    if self.proposal:
        budgets = frappe.get_list("Proposal Budget Plan", filters={"proposal": self.proposal}, pluck="total_planned_budget",limit=10000,ignore_permissions=True)
        grant_reciepts = frappe.get_list("Proposal Grant Receipts", filters={"proposal": self.proposal}, pluck="total_funds_planned",limit=10000,ignore_permissions=True)
        total_funds_planned = float(sum(grant_reciepts) or 0) + float(self.total_funds_planned)
        total_planned_budget = float(sum(budgets) or 0)
        if total_funds_planned > total_planned_budget:
            return frappe.throw("Total funds planned should be less than or equal to total planned budget")
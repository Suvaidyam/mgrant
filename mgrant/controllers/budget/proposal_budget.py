import frappe

def proposal_budget_on_update(self):
    if self.proposal:
        budgets = frappe.get_list("Proposal Budget Plan", filters={"proposal": self.proposal}, pluck="total_planned_budget",limit=10000,ignore_permissions=True)
        if len(budgets):
            proposal_doc = frappe.get_doc("Proposal", self.proposal)
            total_budget = sum(budgets) or 0
            proposal_doc.total_planned_budget = float(total_budget)
            proposal_doc.flags.ignore_mandatory = True
            proposal_doc.save(ignore_permissions=True)
            
def proposal_budget_on_trash(self):
    if self.proposal:
        budgets = frappe.get_list("Proposal Budget Plan", filters={"proposal": self.proposal,'name':["!=",self.name]}, pluck="total_planned_budget",limit=10000,ignore_permissions=True)
        proposal_doc = frappe.get_doc("Proposal", self.proposal)
        if len(budgets):
            total_budget = sum(budgets) or 0
            proposal_doc.total_planned_budget = float(total_budget)
        else:
            proposal_doc.total_planned_budget = float(0)
        proposal_doc.flags.ignore_mandatory = True
        proposal_doc.save(ignore_permissions=True)
            
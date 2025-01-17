import frappe
def proposal_grant_reciept_on_update(self):
    if self.proposal:
        proposal_doc = frappe.get_doc('Proposal',self.proposal)
        if proposal_doc.docstatus == 0:
            prop_tranches = frappe.db.get_list('Proposal Grant Receipts', filters={'proposal': self.proposal}, fields=['name','total_funds_planned'],limit_page_length=1000,ignore_permissions=True)
            total_funds_planned = float(0)
            if len(prop_tranches) > 0:
                for tranche in prop_tranches:
                    total_funds_planned += float(tranche.total_funds_planned or 0)
            proposal_doc.total_planned_budget = total_funds_planned
            proposal_doc.flags.ignore_mandatory = True
            proposal_doc.save(ignore_permissions=True)
        
def proposal_grant_reciept_on_trash(self):
    if self.proposal:
        proposal_doc = frappe.get_doc('Proposal Proposal',self.proposal)
        if proposal_doc.docstatus == 0:
            prop_tranches = frappe.db.get_list('Grant Receipts', filters={'proposal': self.proposal, 'name': ['!=', self.name]}, fields=['name','total_funds_planned'],limit_page_length=1000,ignore_permissions=True)
            total_funds_planned = float(0)
            if len(prop_tranches) > 0:
                for tranche in prop_tranches:
                    total_funds_planned += float(tranche.total_funds_planned or 0)
            proposal_doc.total_planned_budget = total_funds_planned
            proposal_doc.flags.ignore_mandatory = True
            proposal_doc.save(ignore_permissions=True)
    
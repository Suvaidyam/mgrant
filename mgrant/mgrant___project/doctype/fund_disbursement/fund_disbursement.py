from frappe.model.document import Document
import frappe

class FundDisbursement(Document):
    def on_update(self):
        # Calculate total disbursed amount for this grant only
        ttotal_disbursed_amount = frappe.db.sql(f""" 
		SELECT SUM(disbursed_amount) FROM `tabFund Disbursement` WHERE `grant` = '{self.grant}' AND workflow_state = 'Disbursed'
		""")[0][0] or 0

        if self.grant:
            frappe.db.set_value("Grant", self.grant, "total_funds_received", ttotal_disbursed_amount)

    def on_trash(self):
        ttotal_disbursed_amount = frappe.db.sql(f""" 
		SELECT SUM(disbursed_amount) FROM `tabFund Disbursement` WHERE name != '{self.name}' AND `grant` = '{self.grant}' AND workflow_state = 'Disbursed'
		""")[0][0] or 0

        if self.grant:
            frappe.db.set_value("Grant", self.grant, "total_funds_received", ttotal_disbursed_amount)
		
        
from frappe.model.document import Document
import frappe

class FundDisbursement(Document):
    def on_update(self):
        
        # Calculate total disbursed amount for this grant only
        ttotal_disbursed_amount = frappe.db.sql(""" 
		SELECT SUM(disbursed_amount) FROM `tabFund Disbursement` WHERE `grant` = %s
		""", (self.grant,))[0][0] or 0
        print("Total Disbursed Amount", ttotal_disbursed_amount)

        if self.grant:
            frappe.db.set_value("Grant", self.grant, "total_funds_received", ttotal_disbursed_amount)
		
        
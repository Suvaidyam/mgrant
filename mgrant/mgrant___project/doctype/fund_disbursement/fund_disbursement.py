from frappe.model.document import Document
import frappe
from mgrant.controllers.tranche.fund_disbursement import fund_disbursement_on_validate,fund_disbursement_on_update,fund_disbursement_on_trash

class FundDisbursement(Document):
    def validate(self):
        fund_disbursement_on_validate(self)
        
    def on_update(self):
        fund_disbursement_on_update(self)

    def on_trash(self):
        fund_disbursement_on_trash(self)
		
        
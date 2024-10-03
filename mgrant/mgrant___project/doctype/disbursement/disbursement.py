# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Disbursement(Document):
	def on_update(self):
		tranche = frappe.get_doc("Tranches", self.tranche)
		disbursements = frappe.get_all("Disbursement", filters={"tranche": self.tranche}, fields=["disbursement"])
		total_disbursement = 0
		for disbursement in disbursements:
			total_disbursement += disbursement.disbursement if disbursement.disbursement else 0
		if tranche.amount < total_disbursement:
			frappe.throw("Total disbursement cannot be greater than amount allocated")
		else:
			tranche.disbursement = total_disbursement
		tranche.save(ignore_permissions=True)
  
	def on_trash(self):
		tranche = frappe.get_doc("Tranches", self.tranche)
		disbursements = frappe.get_all("Disbursement", filters={"tranche": self.tranche}, fields=["disbursement","name"])
		total_disbursement = 0
		for disbursement in disbursements:
			total_disbursement += disbursement.disbursement if (disbursement.disbursement and disbursement.name != self.name) else 0
		tranche.disbursement = total_disbursement
		tranche.save(ignore_permissions=True)

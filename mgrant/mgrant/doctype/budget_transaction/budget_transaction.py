# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class BudgetTransaction(Document):
	def on_update(self):
		budget = frappe.get_doc("Budget", self.budget)
		if self.transaction:
			budget.expense += self.transaction
			budget.save()

		

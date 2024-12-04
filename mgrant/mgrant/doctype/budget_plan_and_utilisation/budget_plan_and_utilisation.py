# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from mgrant.controllers.budget.budget_planning import budget_validate

class BudgetPlanandUtilisation(Document):
	def validate(self):
		budget_validate(self)
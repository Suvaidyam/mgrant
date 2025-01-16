# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from mgrant.controllers.grant.grant import grant_after_insert , grant_on_validate,copy_budget_and_lfas

class Grant(Document):
	def after_insert(self):
		grant_after_insert(self)

	def validate(self):
		grant_on_validate(self)

	def on_update(self):
		copy_budget_and_lfas(self)
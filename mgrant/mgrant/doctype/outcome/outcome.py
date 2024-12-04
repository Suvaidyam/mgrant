# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from mgrant.controllers.outcome.outcome import outcome_on_validate

class Outcome(Document):
	def validate(self):
		outcome_on_validate(self)

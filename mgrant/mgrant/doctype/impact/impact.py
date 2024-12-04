# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from mgrant.controllers.impact.impact import impact_on_validate

class Impact(Document):
	def validate(self):
		impact_on_validate(self)

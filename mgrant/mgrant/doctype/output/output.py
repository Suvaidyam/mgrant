# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from mgrant.controllers.output.output import output_on_validate

class Output(Document):
	def validate(self):
		output_on_validate(self)

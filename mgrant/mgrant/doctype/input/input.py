# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from mgrant.controllers.input.input import input_on_validate

class Input(Document):
	def validate(self):
		input_on_validate(self)
# Copyright (c) 2025, Suvaidyam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from mgrant.controllers.ngo.vendor import vendor_after_insert

class NGO(Document):
	def after_insert(self):
		vendor_after_insert(self)
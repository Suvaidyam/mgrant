# Copyright (c) 2025, Suvaidyam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from mgrant.controllers.ngo_dd.ngo_dd import ngo_dd_on_update,ngo_dd_on_validate

class NGODueDiligence(Document):
	def on_update(self):
		ngo_dd_on_update(self)

	def validate(self):
		ngo_dd_on_validate(self)

# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from mgrant.controllers.ngo.ngo import ngo_after_insert,ngo_before_save

class NGO(Document):
	def after_insert(self):
		ngo_after_insert(self)

	def before_save(self):
		ngo_before_save(self)
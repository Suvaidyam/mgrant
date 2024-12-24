# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from mgrant.controllers.grant.grant import grant_after_insert

class Grant(Document):
	def after_insert(self):
		grant_after_insert(self)

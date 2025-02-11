# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from mgrant.controllers.tranche.grant_reciept import grant_reciept_on_update, grant_reciept_on_trash,grant_reciept_on_validate
class GrantReceipts(Document):
	def validate(self):
		grant_reciept_on_validate(self)

	def on_update(self):
		grant_reciept_on_update(self)

	def on_trash(self):
		grant_reciept_on_trash(self)
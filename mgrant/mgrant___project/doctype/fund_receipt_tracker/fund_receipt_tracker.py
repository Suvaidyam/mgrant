# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

from frappe.model.document import Document
from mgrant.controllers.tranche.grant_reciept_tracker import fund_tracker_on_update, fund_tracker_on_trash

class FundReceiptTracker(Document):
	def on_update(self):
		fund_tracker_on_update(self)
  
	def on_trash(self):
		fund_tracker_on_trash(self)

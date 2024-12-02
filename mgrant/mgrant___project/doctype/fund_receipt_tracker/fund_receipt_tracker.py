# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class FundReceiptTracker(Document):
    pass
	# def on_update(self):
	# 	tranche = frappe.get_doc("Tranches", self.tranche)
	# 	fund_receipt_trackers = frappe.get_all("FundReceiptTracker", filters={"tranche": self.tranche}, fields=["fund_receipt_tracker"])
	# 	total_fund_receipt_tracker = 0
	# 	for fund_receipt_tracker in fund_receipt_trackers:
	# 		total_fund_receipt_tracker += fund_receipt_tracker.fund_receipt_tracker if fund_receipt_tracker.fund_receipt_tracker else 0
	# 	if tranche.amount < total_fund_receipt_tracker:
	# 		frappe.throw("Total fund_receipt_tracker cannot be greater than amount allocated")
	# 	else:
	# 		tranche.total_fund_receipt_tracker = total_fund_receipt_tracker
	# 	tranche.save(ignore_permissions=True)
  
	# def on_trash(self):
	# 	tranche = frappe.get_doc("Tranches", self.tranche)
	# 	fund_receipt_trackers = frappe.get_all("FundReceiptTracker", filters={"tranche": self.tranche}, fields=["fund_receipt_tracker","name"])
	# 	total_fund_receipt_tracker = 0
	# 	for fund_receipt_tracker in fund_receipt_trackers:
	# 		total_fund_receipt_tracker += fund_receipt_tracker.fund_receipt_tracker if (fund_receipt_tracker.fund_receipt_tracker and fund_receipt_tracker.name != self.name) else 0
	# 	tranche.total_fund_receipt_tracker = total_fund_receipt_tracker
	# 	tranche.save(ignore_permissions=True)

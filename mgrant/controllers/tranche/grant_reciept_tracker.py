import frappe
from mgrant.utils import get_positive_state_closure

def fund_tracker_on_update(self):
    positive_state = get_positive_state_closure(self.doctype)
    gr = frappe.get_doc("Grant Receipts", self.grant_reciept)
    fund_receipt_trackers = frappe.get_all("Fund Receipt Tracker", filters={"grant_reciept": self.grant_reciept,"workflow_state":positive_state}, fields=["funds_received"])
    total_funds_recieved = 0
    for fund_receipt_tracker in fund_receipt_trackers:
        total_funds_recieved += fund_receipt_tracker.funds_received if fund_receipt_tracker.funds_received else 0
    if gr.total_funds_planned < total_funds_recieved:
        frappe.throw("Total fund_receipt_tracker cannot be greater than amount allocated")
    else:
        gr.total_funds_received = float(total_funds_recieved) or 0
    gr.save(ignore_permissions=True)

def fund_tracker_on_trash(self):
    positive_state = get_positive_state_closure(self.doctype)
    gr = frappe.get_doc("Grant Receipts", self.grant_reciept)
    fund_receipt_trackers = frappe.get_all("Fund Receipt Tracker", filters={"grant_reciept": self.grant_reciept,'name':['!=',self.name],"workflow_state":positive_state}, fields=["funds_received"])
    total_funds_recieved = 0
    for fund_receipt_tracker in fund_receipt_trackers:
        total_funds_recieved += fund_receipt_tracker.funds_received if fund_receipt_tracker.funds_received else 0
    if gr.total_funds_planned < total_funds_recieved:
        frappe.throw("Total fund_receipt_tracker cannot be greater than amount allocated")
    else:
        gr.total_funds_received = float(total_funds_recieved) or 0
    gr.save(ignore_permissions=True)
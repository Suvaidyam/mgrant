# Copyright (c) 2024, Frappe Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe import _

def execute(filters=None):
    columns = get_columns()
    data = get_data(filters)
    return columns, data

def get_columns():
    return [
        {
            "fieldname": "name",
            "label": _("Grant"),
            "fieldtype": "Link",
            "options": "Grant",
            "width": 180
        },
        {
            "fieldname": "total_planned_budget",
            "label": _("Total Planned Budget"),
            "fieldtype": "Currency",
            "width": 150
        },
        {
            "fieldname": "total_funds_received",
            "label": _("Total Funds Received"),
            "fieldtype": "Currency",
            "width": 150
        },
        {
            "fieldname": "total_funds_utilised",
            "label": _("Total Funds Utilised"),
            "fieldtype": "Currency",
            "width": 150
        },
        {
            "fieldname": "total_unspent_funds",
            "label": _("Total Unspent Funds"),
            "fieldtype": "Currency",
            "width": 150
        },
        {
            "fieldname": "total_amount_requested_from_donor",
            "label": _("Total Amount Requested"),
            "fieldtype": "Currency",
            "width": 150
        },
        {
            "fieldname": "unutilised_disbursed_amount",
            "label": _("Unutilised Disbursed Amount"),
            "fieldtype": "Currency",
            "width": 150
        }
    ]

def get_data(filters):
    grants = frappe.get_all(
        "Grant",
        fields=[
            "name",
            "total_planned_budget",
            "total_funds_received",
            "total_funds_utilised",
            "total_unspent_funds",
            "total_amount_requested_from_donor",
            "(total_funds_received - total_funds_utilised) as unutilised_disbursed_amount"
        ],
        filters=filters
    )
    
    return grants

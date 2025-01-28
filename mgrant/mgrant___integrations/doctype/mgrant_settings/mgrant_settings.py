# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class mGrantSettings(Document):
    def before_save(self):
        check_ps = frappe.db.exists("Property Setter", {
            "doc_type": "Proposal",
            "doctype_or_field":"DocField",
            "field_name": "stage",
            "property": "options"
        })
        
        # Extract stage values
        stages = "\n".join([d.stage for d in self.proposal_stages])
        if check_ps:
            ps = frappe.get_doc("Property Setter", check_ps)
        else:
            ps = frappe.new_doc("Property Setter")
            ps.doctype_or_field = "DocField"
            ps.module = "mGrant - Proposal"
            ps.doc_type = "Proposal"
            ps.field_name = "stage"
            ps.property = "options"
        ps.value = stages
        ps.save()
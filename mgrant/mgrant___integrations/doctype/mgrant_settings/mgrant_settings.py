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

    def validate(self):
        stages = {}
        closure_fields = {
            'Sign-Off Prerequisite': {'field': 'sign_off_prerequisite', 'required': True},
            'Positive': {'field': 'positive', 'required': True},
            'Negative': {'field': 'negative', 'required': True},
            'Neutral': {'field': 'neutral', 'required': False}
        }

        for stage in self.get("proposal_stages", []):
            closure_type = stage.get("closure")
            if closure_type:
                stages.setdefault(closure_type, []).append(stage)

        for closure_type, config in closure_fields.items():
            type_stages = stages.get(closure_type, [])

            if len(type_stages) > 1:
                frappe.throw(f'Only one "{closure_type}" closure is allowed in Proposal Stages.')

            if config["required"] and not type_stages:
                frappe.throw(f'Only one "{closure_type}" closure is required in Proposal Stages.')

            self.set(config["field"], type_stages[0].stage if type_stages else "")
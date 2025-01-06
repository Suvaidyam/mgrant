import frappe
from frappe.utils import today

def proposal_on_update(self):
    if self.stage == "Grant Letter Signed" and self.docstatus == 0:
        frappe.msgprint("Proposal is now converted to Grant")
        self.submit()
        
def proposal_before_submit(self):
    if self.stage != "Grant Letter Signed":
        frappe.throw("Proposal is not in Grant Letter Signed stage")
        
def proposal_on_submit(self):
    if self.stage == "Grant Letter Signed":
        grant = frappe.new_doc("Grant")
        grant.proposal = self.name
        grant.donor = self.donor
        grant.grant_name = self.proposal_name
        grant.start_date = today()
        grant.end_date = self.end_date
        grant.implementation_type = self.implementation_type
        grant.grant_description = self.proposal_description
        grant.theme = self.theme
        grant.sdg = self.sdg
        grant.focus_area = self.focus_area
        grant.programme = self.programme
        if len(self.demography_focus) > 0:
            for df in self.demography_focus:
                grant.append("demography_focus", {
                    "demography_group": df.demography_group,
                    "other_name": df.other_name,
                    "count": df.count,
                    "state": df.state,
                    "district": df.district,
                    "block": df.block,
                    "gram_panchayat": df.gram_panchayat,
                    "village": df.village
                })
        if len(self.states) > 0:
            for state in self.states:
                grant.append("states", {
                    "state": state.state
                })
        if len(self.districts) > 0:
            for district in self.districts:
                grant.append("districts", {
                    "district": district.district
                })
        if len(self.blocks) > 0:
            for block in self.blocks:
                grant.append("blocks", {
                    "block": block.block
                })
        if len(self.villages) > 0:
            for village in self.villages:
                grant.append("villages", {
                    "village": village.village
                })
        grant.insert(ignore_permissions=True,ignore_mandatory=True)
        tranches = frappe.get_all("Grant Receipts", filters={"proposal": self.name}, pluck="name")
        if len(tranches) > 0:
            for tranche in tranches:
                tranche_doc = frappe.get_doc("Grant Receipts", tranche)
                tranche_doc.grant = grant.name
                tranche_doc.save(ignore_permissions=True)
        budget_plans = frappe.get_all("Proposal Budget Plan", filters={"proposal": self.name}, fields=['*'])
        if len(budget_plans) > 0:
            for budget_plan in budget_plans:
                budget_plan_doc = frappe.new_doc("Budget Plan and Utilisation")
                budget_plan_doc.update(budget_plan)
                budget_plan_doc.grant = grant.name
                budget_plan_doc.flags.ignore_mandatory = True
                budget_plan_doc.save(ignore_permissions=True)
        inputs = frappe.get_all("Proposal Input", filters={"proposal": self.name}, fields=['*'])
        if len(inputs) > 0:
            for input in inputs:
                input_doc = frappe.new_doc("Input")
                input_doc.update(input)
                input_doc.grant = grant.name
                input_doc.flags.ignore_mandatory = True
                input_doc.save(ignore_permissions=True)
        outputs = frappe.get_all("Proposal Output", filters={"proposal": self.name}, fields=['*'])
        if len(outputs) > 0:
            for output in outputs:
                output_doc = frappe.new_doc("Output")
                output_doc.update(output)
                output_doc.grant = grant.name
                output_doc.flags.ignore_mandatory = True
                output_doc.save(ignore_permissions=True)
        impacts = frappe.get_all("Proposal Impact", filters={"proposal": self.name}, fields=['*'])
        if len(impacts) > 0:
            for impact in impacts:
                impact_doc = frappe.new_doc("Impact")
                impact_doc.update(impact)
                impact_doc.grant = grant.name
                impact_doc.flags.ignore_mandatory = True
                impact_doc.save(ignore_permissions=True)
        outcomes = frappe.get_all("Proposal Outcome", filters={"proposal": self.name}, fields=['*'])
        if len(outcomes) > 0:
            for outcome in outcomes:
                outcome_doc = frappe.new_doc("Outcome")
                outcome_doc.update(outcome)
                outcome_doc.grant = grant.name
                outcome_doc.flags.ignore_mandatory = True
                outcome_doc.save(ignore_permissions=True)
        tasks = frappe.get_all("mGrant Task", filters={"reference_doctype": "Proposal","related_to":self.name},fields=['*'])
        for task in tasks:
            task_doc = frappe.new_doc("mGrant Task")
            task_doc.update(task)
            task_doc.reference_doctype = "Grant"
            task_doc.related_to = grant.name
            task_doc.save(ignore_permissions=True)
        gallery_items = frappe.get_all("Gallery", filters={"document_type": "Proposal","related_to":self.name},fields=['*'])
        for gallery_item in gallery_items:
            gallery_doc = frappe.new_doc("Gallery")
            gallery_doc.update(gallery_item)
            gallery_doc.document_type = "Grant"
            gallery_doc.related_to = grant.name
            gallery_doc.save(ignore_permissions=True)
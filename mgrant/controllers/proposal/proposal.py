import frappe
# from frappe.utils import today

def proposal_on_update(self):
    module = frappe.db.get_single_value('mGrant Settings', 'module')
    if ((module == "Donor" and self.donor_stage == "MoU Signed") or (module == "NGO" and self.ngo_stage == "Grant Letter Signed")) and self.docstatus == 0:
        frappe.msgprint("Proposal is now converted to Grant")
        self.submit()
        
def proposal_before_submit(self):
    module = frappe.db.get_single_value('mGrant Settings', 'module')
    if module == "Donor" and self.donor_stage != "MoU Signed":
        frappe.throw("Proposal is not in MoU Signed stage")
    elif module == "NGO" and self.ngo_stage != "Grant Letter Signed":
        frappe.throw("Proposal is not in Grant Letter Signed stage")
        
def proposal_on_submit(self):
    module = frappe.db.get_single_value('mGrant Settings', 'module')
    if (module == "Donor" and self.donor_stage == "MoU Signed") or (module == "NGO" and self.ngo_stage == "Grant Letter Signed"):
        grant = frappe.new_doc("Grant")
        grant.proposal = self.name
        grant.donor = self.donor
        grant.grant_name = self.proposal_name
        # grant.start_date = today()
        # grant.end_date = self.end_date
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
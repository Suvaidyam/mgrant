import frappe
from frappe.utils import money_in_words
from frappe.utils.pdf import get_pdf


def proposal_before_save(self):
    user_roles = frappe.get_roles()  # Retrieves roles of the current user
    wf_name = frappe.db.get_value("Workflow", {"document_type": self.doctype, "is_active": 1}, "name")
    if wf_name:
        wf = frappe.get_doc("Workflow", wf_name)
        old_doc = self.get_doc_before_save()
        if old_doc:
            # Get old and new workflow states
            old_value = old_doc.get(wf.workflow_state_field)
            new_value = self.get("stage")
            if old_value != new_value:
                valid_transition = False

                # Check transitions in the workflow
                for wt in wf.transitions:
                    if wt.state == old_value:
                        if wt.next_state == new_value:
                            if wt.allowed in user_roles:
                                valid_transition = True
                            else:
                                frappe.throw('Your  role does not have permission to perform this action')
                            break

                # If no valid transition found, raise an error
                if not valid_transition:
                    frappe.throw(
                        f"Invalid transition from '{old_value}' to '{new_value}'. "
                        f"Expected transition: {', '.join([t.next_state for t in wf.transitions if t.state == old_value])}"
                    )

def proposal_on_validate(self):
    final_positive_stage = frappe.db.get_single_value('mGrant Settings', 'final_positive_stage')
    if not final_positive_stage:
        return frappe.throw("Please set Final Positive Stage in <a href='/app/mgrant-settings/mGrant%20Settings'>mGrant Settings</a>")
def proposal_on_update(self):
    final_positive_stage = frappe.db.get_single_value('mGrant Settings', 'final_positive_stage')
    if ((self.stage == final_positive_stage) or (self.stage == final_positive_stage)) and self.docstatus == 0:
        self.submit()
        frappe.msgprint("Proposal is now converted to Grant")


def proposal_before_submit(self):
    final_positive_stage = frappe.db.get_single_value('mGrant Settings', 'final_positive_stage')
    final_negative_stage = frappe.db.get_single_value('mGrant Settings', 'final_negative_stage')
    if self.stage not in [final_positive_stage, final_negative_stage]:
        frappe.throw(f"Proposal is neither in final positive stage nor in final negative stage")

    if (self.mou_verified == 0 or not self.mou_signed_document):
        frappe.throw("MoU is not verified")

def proposal_on_submit(self):
    self.file_url = f"{frappe.utils.get_url()}/app/proposal/{self.name}"
    final_positive_stage = frappe.db.get_single_value('mGrant Settings','final_positive_stage')
    if (self.stage == final_positive_stage) or (self.stage == final_positive_stage):
        grant = frappe.new_doc("Grant")
        grant.proposal = self.name
        grant.donor = self.donor
        grant.ngo = self.ngo or self.vendor
        grant.grant_name = self.proposal_name
        grant.start_date = self.start_date
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
        tranches = frappe.get_all("Proposal Grant Receipts", filters={"proposal": self.name}, fields=['*'])
        if len(tranches) > 0:
            for tranche in tranches:
                tranche_doc = frappe.new_doc("Grant Receipts")
                tranche_doc.update(tranche)
                tranche_doc.grant = grant.name
                tranche_doc.flags.ignore_mandatory = True
                tranche_doc.save(ignore_permissions=True)
        tasks = frappe.get_all("ToDo", filters={"reference_type": "Proposal","reference_name":self.name},fields=['*'])
        if len(tasks) > 0:
            for task in tasks:
                task_doc = frappe.new_doc("ToDo")
                task_doc.update(task)
                task_doc.reference_type = "Grant"
                task_doc.reference_name = grant.name
                task_doc.flags.ignore_mandatory = True
                task_doc.save(ignore_permissions=True)
        gallery_items = frappe.get_all("Gallery", filters={"document_type": "Proposal","related_to":self.name},fields=['*'])
        if len(gallery_items) > 0:
            for gallery_item in gallery_items:
                gallery_doc = frappe.new_doc("Gallery")
                gallery_doc.update(gallery_item)
                gallery_doc.document_type = "Grant"
                gallery_doc.related_to = grant.name
                gallery_doc.flags.ignore_mandatory = True
                gallery_doc.save(ignore_permissions=True)

from datetime import datetime
@frappe.whitelist()
def generate_mou_doc(*args):
    proposal = args[0] if args else frappe.form_dict.get('proposal')
    if frappe.db.exists("Proposal", proposal):
        proposal_details = frappe.get_doc("Proposal", proposal)
        ngo_details = frappe.get_doc("NGO", proposal_details.ngo)
        inputs = frappe.get_list("Proposal Input", filters={"proposal": proposal}, fields=["name", "input_name", "kpi", "frequency", "total_target"])
        outputs = frappe.get_list("Proposal Output", filters={"proposal": proposal}, fields=["name", "output_name", "kpi", "frequency", "total_target"])
        impacts = frappe.get_list("Proposal Impact", filters={"proposal": proposal}, fields=["name", "impact_name", "kpi", "frequency", "total_target"])
        outcomes = frappe.get_list("Proposal Outcome", filters={"proposal": proposal}, fields=["name", "outcome_name", "kpi", "frequency", "total_target"])
        budgets = frappe.get_list("Proposal Budget Plan", filters={"proposal": proposal}, fields=["name", "item_name", "budget_head", "frequency", "total_planned_budget"])
        tranches = frappe.get_list("Proposal Grant Receipts", filters={"proposal": proposal}, fields=["name", "financial_year", "tranch_no", "planned_due_date"])
        tasks = frappe.get_list("ToDo", filters={"reference_type": 'Proposal',"reference_name":proposal}, fields=["*"])

        other_details = {}
        formatted_modified_date = proposal_details.modified.strftime("%d-%m-%Y")
        formatted_start_date = proposal_details.start_date.strftime("%d-%m-%Y")
        formatted_end_date = proposal_details.end_date.strftime("%d-%m-%Y")
        amount_in_words = money_in_words(proposal_details.total_planned_budget)

        other_details["modified_date"] = formatted_modified_date
        other_details["start_date"] = formatted_start_date
        other_details["end_date"] = formatted_end_date
        other_details["amount_in_words"] = amount_in_words


        print_format_template = frappe.get_doc("Print Format", "MoU Template").html
        mou_template = frappe.render_template(print_format_template, {"proposal": proposal_details, "other_details": other_details,"ngo_details":ngo_details,"inputs":inputs,"outputs":outputs,"impacts":impacts,"outcomes":outcomes,"tasks":tasks,"budgets":budgets,"tranches":tranches})

        pdf = get_pdf(mou_template)
        today = frappe.utils.nowdate()
        formated_today = datetime.strptime(today, "%Y-%m-%d").strftime("%d-%m-%Y")
        filename = f"{proposal}_MoU_To_be_signed_{formated_today}.pdf"
        frappe.local.response.filename = filename
        frappe.local.response.filecontent = pdf
        frappe.local.response.type = "download"
    else:
        frappe.throw(f"Proposal '{proposal}' does not exist")                        

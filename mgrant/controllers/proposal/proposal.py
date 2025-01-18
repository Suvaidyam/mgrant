import frappe
from frappe.utils import money_in_words
from frappe.utils.pdf import get_pdf
from frappe.utils.file_manager import save_file


def proposal_after_insert(self):
    module = frappe.db.get_single_value('mGrant Settings', 'module')
    if module == "Donor" and self.ngo and self.donor_stage == "Application Started":
        # Fetch NGO and Donor emails
        ngo_email = frappe.db.get_value('NGO', self.ngo, 'email')
        donor_email = frappe.db.get_value('Donor', self.donor, 'email')
        
        # Send email to NGO
        if ngo_email:
            frappe.sendmail(
                recipients=ngo_email,
                subject='New Application Started',
                message="Thank you for submitting your application. We are reviewing it and will shortly get back to you."
            )
        
        # Send email to Donor
        if donor_email:
            frappe.sendmail(
                recipients=donor_email,
                subject='New Application Started',
                message=f"<p>A new application has been submitted by {self.ngo_name}. "
                        f"<a href='{frappe.utils.get_url()}/app/proposal/{self.name}'>View Application</a></p>"
            )


def proposal_on_update(self):
    module = frappe.db.get_single_value('mGrant Settings', 'module')
    if ((module == "Donor" and self.donor_stage == "MoU Signed") or (module == "NGO" and self.ngo_stage == "Grant Letter Signed")) and self.docstatus == 0:
        frappe.msgprint("Proposal is now converted to Grant")
        self.submit()
    if self.donor_stage == "MoU Signing ongoing" and not self.mou_doc:
        generate_mou_doc(self.name)

        
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
        for task in tasks:
            task_doc = frappe.new_doc("ToDo")
            task_doc.update(task)
            task_doc.reference_type = "Grant"
            task_doc.reference_name = grant.name
            task_doc.flags.ignore_mandatory = True
            task_doc.save(ignore_permissions=True)
        gallery_items = frappe.get_all("Gallery", filters={"document_type": "Proposal","related_to":self.name},fields=['*'])
        for gallery_item in gallery_items:
            gallery_doc = frappe.new_doc("Gallery")
            gallery_doc.update(gallery_item)
            gallery_doc.document_type = "Grant"
            gallery_doc.related_to = grant.name
            gallery_doc.flags.ignore_mandatory = True
            gallery_doc.save(ignore_permissions=True)

from datetime import datetime
@frappe.whitelist()
def generate_mou_doc(proposal):
    if frappe.db.exists("Proposal", proposal):
        proposal_details = frappe.get_doc("Proposal", proposal)
        donor_details = frappe.get_doc("Donor", proposal_details.donor)
        ngo_details = frappe.get_doc("NGO", proposal_details.ngo)
        inputs = frappe.get_list("Proposal Input", filters={"proposal": proposal}, fields=["name", "input_name", "kpi", "frequency", "total_target"])
        outputs = frappe.get_list("Proposal Output", filters={"proposal": proposal}, fields=["name", "output_name", "kpi", "frequency", "total_target"])
        impacts = frappe.get_list("Proposal Impact", filters={"proposal": proposal}, fields=["name", "impact_name", "kpi", "frequency", "total_target"])
        outcomes = frappe.get_list("Proposal Outcome", filters={"proposal": proposal}, fields=["name", "outcome_name", "kpi", "frequency", "total_target"])
        budgets = frappe.get_list("Proposal Budget Plan", filters={"proposal": proposal}, fields=["name", "item_name", "budget_head", "frequency", "total_planned_budget"])
        tranches = frappe.get_list("Grant Receipts", filters={"proposal": proposal}, fields=["name", "financial_year", "tranch_no", "planned_due_date"])
        tasks = frappe.get_list("mGrant Task", filters={"reference_doctype": 'Proposal',"related_to":proposal}, fields=["*"])

        if proposal_details.mou_doc:
            existing_file = frappe.get_doc("File", {"file_url": proposal_details.mou_doc})
            if frappe.db.exists("Gallery", {"image": proposal_details.mou_doc}):
                existing_gallery = frappe.get_doc("Gallery", {"image": proposal_details.mou_doc})
                existing_gallery.delete()
            existing_file.delete()
            frappe.db.commit()

        other_details = {}
        formatted_modified_date = proposal_details.modified.strftime("%d-%m-%Y")
        formatted_start_date = proposal_details.start_date.strftime("%d-%m-%Y")
        formatted_end_date = proposal_details.end_date.strftime("%d-%m-%Y")
        amount_in_words = money_in_words(proposal_details.total_planned_budget)

        other_details["modified_date"] = formatted_modified_date
        other_details["start_date"] = formatted_start_date
        other_details["end_date"] = formatted_end_date
        other_details["amount_in_words"] = amount_in_words
        mou_template = frappe.render_template("mgrant/templates/pages/mou_template.html", {"proposal": proposal_details, "other_details": other_details,"ngo_details":ngo_details,"inputs":inputs,"outputs":outputs,"impacts":impacts,"outcomes":outcomes,"tasks":tasks,"budgets":budgets,"tranches":tranches})
        
        pdf = get_pdf(mou_template)
        today = frappe.utils.nowdate()
        formated_today = datetime.strptime(today, "%Y-%m-%d").strftime("%d-%m-%Y")
        filename = f"{proposal}_MoU_To_be_signed_{formated_today}.pdf"

        saved_file = save_file(
            fname=filename,
            content=pdf,
            dt="Proposal",
            dn=proposal,
            is_private=0
        )
        file_doc = frappe.get_doc("File", saved_file.name)
        file_doc.file_name = filename
        file_doc.file_url = f"/files/{filename}"
        file_doc.save()
        frappe.db.commit()

        if saved_file:
            frappe.db.set_value("Proposal", proposal_details.name, {
                "mou_doc": file_doc.file_url,
            }, update_modified=False)
            frappe.db.commit()

            gallery = frappe.new_doc("Gallery")
            gallery.document_type = "Proposal"
            gallery.related_to = proposal
            gallery.image = file_doc.file_url
            gallery.title = filename
            gallery.save(ignore_permissions=True)
            frappe.db.commit()

            frappe.sendmail(
            recipients=[donor_details.email,ngo_details.email],
            subject=f"MOU Document for {proposal}",
            message=f"Please find attached the MOU Document for {proposal}",
            attachments=[
                {
                    "fname": filename,
                    "fcontent": pdf,
                },
            ],
            reference_doctype="Proposal",
            reference_name=proposal,
            ) 
            return file_doc.file_url
        else:
            frappe.throw("Error while saving MOU Document")
    else:
        frappe.throw(f"Proposal '{proposal}' does not exist")                        


@frappe.whitelist()
def upload_signed_mou(proposal, mou_signed_document):
    if proposal and mou_signed_document:
        if frappe.db.exists("Proposal", proposal):
            frappe.db.set_value("Proposal", proposal, {
                "mou_signed_document": mou_signed_document,
            }, update_modified=False)
            frappe.db.commit()
            return "MOU Signed Document uploaded successfully"
        else:
            frappe.throw(f"Proposal '{proposal}' does not exist")
    else:
        frappe.throw("Please provide MOU Signed Document")
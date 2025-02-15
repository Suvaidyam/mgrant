import frappe
from frappe import enqueue
from frappe.utils.pdf import get_pdf
from frappe.utils.file_manager import save_file
from frappe.utils import money_in_words
from datetime import datetime
from mgrant.utils import get_state_closure, get_positive_state_closure


def generate_disbursement_memo_pdf(doc):
    if frappe.db.exists("Print Format", "Disbursement Memo Template"):
        print_format_template = frappe.get_doc("Print Format", "Disbursement Memo Template").html
        if isinstance(doc["modified"], str):
            formatted_approval_date = datetime.strptime(doc["modified"], "%Y-%m-%d %H:%M:%S.%f").strftime("%d-%m-%Y")
        else:
            formatted_approval_date = doc["modified"].strftime("%d-%m-%Y")
            
        approval_amount_in_words = money_in_words(doc.disbursed_amount)

        if frappe.db.exists("NGO", doc.ngo):
            ngo = frappe.get_doc("NGO", doc.ngo)
        else:
            ngo = {}    
        if frappe.db.exists("Donor", doc.donor):
            donor = frappe.get_doc("Donor", doc.donor)
        else:
            donor = {}    

        doc['sr_no'] = 1
        doc['formatted_approval_date'] = formatted_approval_date
        doc['approval_amount_in_words'] = approval_amount_in_words
        memo_template = frappe.render_template(print_format_template ,{"data":doc, "ngo":ngo, "donor":donor})
        try:
            pdf = get_pdf(memo_template)
            return pdf
        except Exception as e:
            frappe.log_error("PDF generation exception in memo template", frappe.get_traceback())
            return e
    else:
        frappe.throw("Print Format 'Disbursement Memo Template' not found ")        

def generate_disbursement_memo(doc):
    pdf = generate_disbursement_memo_pdf(doc)
    file_name = f"{doc.name}.pdf"
    try:
        saved_file = save_file(
            fname=file_name,
            content=pdf,
            dt="Fund Disbursement",
            dn=doc.name,
            is_private=0
        )
        if saved_file:
            frappe.db.set_value("Fund Disbursement", doc.name, "memo_template", saved_file.file_url,update_modified=False)

    except Exception as e:
        frappe.log_error("PDF save exception in memo template", frappe.get_traceback())


def validate(self):
    if self.request_date:
        dt = frappe.utils.getdate(self.request_date)
        mgrant_settings = frappe.get_doc("mGrant Settings")
        if frappe.db.exists("mGrant Settings Grant Wise", self.grant):
            mgrant_settings = frappe.get_doc("mGrant Settings Grant Wise", self.grant)
        if mgrant_settings.get('year_type') == "Financial Year":
            if dt.month < 4:
                self.financial_year = f"FY-{dt.year-1}"
            else:
                self.financial_year = f"FY-{dt.year}"
        else:
            self.financial_year = f"FY-{dt.year}"
            
    if self.requested_amount and self.approved_amount:
        if self.approved_amount > self.requested_amount:
            frappe.throw("Approved Amount cannot be greater than Requested Amount")

def after_save(self):
    print("Fund Request Saved", self.doctype)

def on_update(self):
    request_validation(self)
    positive_state = get_positive_state_closure(self.doctype)
    requests = frappe.get_list("Fund Request", filters={"grant": self.grant,"workflow_state":positive_state}, pluck="requested_amount",limit=10000,ignore_permissions=True)
    total_requested_amount = float(sum(requests) or 0)
    if self.grant:
        frappe.db.set_value("Grant", self.grant, "total_amount_requested_from_donor", total_requested_amount)
    
    # Check if workflow state is positive and create a Fund Disbursement if not already created
    state_status = get_state_closure(self.doctype, self.workflow_state)
    if state_status == "Positive":
        if frappe.db.exists("Fund Disbursement", {"fund_request": self.name}):
            frappe.throw("Fund Disbursement already created for this Fund Request")
            
        # Create new Fund Disbursement document
        _doc = frappe.new_doc("Fund Disbursement")
        _doc.fund_request = self.name
        _doc.grant = self.grant
        _doc.disbursed_amount = self.approved_amount
        _doc.description = f"Disbursement of Fund ({self.description})"
        _doc.as_on_date = frappe.utils.now_datetime()
        _doc.insert()

        enqueue(
            method=generate_disbursement_memo,
            queue="default",
            timeout=300,
            job_name=f"generate_disbursement_memo{_doc.name}",
            doc = _doc.as_dict()
        )    

def on_trash(self):
    positive_state = get_positive_state_closure(self.doctype)
    requests = frappe.get_list("Fund Request", filters={"grant": self.grant,"name":['!=',self.name],"workflow_state":positive_state}, pluck="requested_amount",limit=10000,ignore_permissions=True)
    total_requested_amount = float(sum(requests) or 0)
    if self.grant:
        frappe.db.set_value("Grant", self.grant, "total_amount_requested_from_donor", total_requested_amount)
        
def request_validation(self):
    gr_positive_state = get_positive_state_closure("Grant Receipts")
    fr_positive_state = get_positive_state_closure(self.doctype)
    if self.grant:
        planned_tranches = frappe.get_list("Grant Receipts", filters={"grant": self.grant,"workflow_state":gr_positive_state,"planned_due_date":["<=",self.request_date]}, pluck="total_funds_planned",limit=10000,ignore_permissions=True)
        disbs = frappe.get_list("Fund Disbursement", filters={"grant": self.grant}, pluck="disbursed_amount",limit=10000,ignore_permissions=True)
        total_funds_planned = float(sum(planned_tranches) or 0)
        total_disbursements = float(sum(disbs) or 0)
        remained_disbursements = total_funds_planned - total_disbursements
        if self.workflow_state == fr_positive_state:
            if self.approved_amount > remained_disbursements:
                frappe.throw(f"Approved Amount cannot be greater than ({remained_disbursements}).")
        else:
            if self.requested_amount > remained_disbursements:
                frappe.throw(f"Requested Amount cannot be greater than ({remained_disbursements}).")
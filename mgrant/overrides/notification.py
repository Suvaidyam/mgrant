import frappe
from frappe.email.doctype.notification.notification import Notification
from frappe.email.doctype.notification.notification import get_context
from frappe.utils import add_to_date, nowdate
from mgrant.utils import calculate_business_days


class CustomNotification(Notification):
    def get_documents_for_today(self):
        docs = []
        diff_days = self.days_in_advance
        if self.event == "Days After":
            diff_days = -diff_days
        if self.custom_using_business_days:
            reference_date = calculate_business_days(nowdate(), diff_days)
            reference_date = str(reference_date)
        else:
            reference_date = add_to_date(nowdate(), days=diff_days)
        reference_date_start = reference_date + " 00:00:00.000000"
        reference_date_end = reference_date + " 23:59:59.000000"

        doc_list = frappe.get_all(
            self.document_type,
            fields="name",
            filters=[
                {self.date_changed: (">=", reference_date_start)},
                {self.date_changed: ("<=", reference_date_end)},
            ],
        )

        for d in doc_list:
            doc = frappe.get_doc(self.document_type, d.name)

            if self.condition and not frappe.safe_eval(self.condition, None, get_context(doc)):
                continue

            docs.append(doc)

        return docs
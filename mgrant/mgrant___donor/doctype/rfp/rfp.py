# Copyright (c) 2025, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class RFP(Document):
	def on_update(self):
			for row in self.get("invitation"):
				if row.invitee_type == "Existing" and row.email and row.status == "Draft":
					baseurl = frappe.get_conf().get('hostname')
					url = f"{baseurl}/api/method/mgrant.apis.rfp.rfp.get_rfp_list?rfp={self.name}&donor={self.donor}&ngo={row.ngo}"
					print_format_template = frappe.get_doc("Print Format", "Existing RFP").html
					rfp_template = frappe.render_template(print_format_template, {"doc": self,"url":url,"ngo_name":row.full_name})
					
					frappe.sendmail(
						recipients=row.email,
						subject=f"Invitation to Submit Proposal – {self.title}",
						message=rfp_template,
						now=True
					)

					row.status = "Sent"
					row.save()


# Copyright (c) 2025, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from datetime import datetime


class RFP(Document):
			
	def mark_child_table_changes(self, child_table_fieldname):
		old_doc = self.get_doc_before_save()
		old_rows = {row.name: row.as_dict() for row in old_doc.get(child_table_fieldname, [])} if old_doc else {}
	
		new_rows = {row.name: row for row in self.get(child_table_fieldname, [])}
		# Track changes
		for row in self.get(child_table_fieldname, []):
			if row.name not in old_rows:
				row.status = "New"  # Newly added row
			else:
				old_row = old_rows[row.name]
				for field in row.as_dict():
					if field not in ["name", "idx","creation","modified"] and old_row.get(field) != row.get(field):
						row.status = "Updated"
						break
				else:
					row.status = "Unchanged"  # No changes detected
	
		# Find deleted rows
		deleted_rows = set(old_rows.keys()) - set(new_rows.keys())
		for deleted_row_name in deleted_rows:
			deleted_row = old_rows[deleted_row_name]
			deleted_row["status"] = "Deleted"
			new_rows[deleted_row_name] = deleted_row  # Keep track of deleted rows
	
		return list(new_rows.values())


	def on_update(self):
			for row in self.get("invitation"):
				if row.invitee_type == "Existing" and row.email and row.status == "Draft":
					formatted_deadline_date = datetime.strptime(self.deadline, "%Y-%m-%d").strftime("%d-%m-%Y")
					baseurl = frappe.get_conf().get('hostname')
					url = f"{baseurl}/api/method/mgrant.apis.rfp.rfp.get_rfp_list?rfp={self.name}&donor={self.donor}&ngo={row.ngo}"
					if frappe.db.exists("Print Format", "Existing RFP"):
						print_format_template = frappe.get_doc("Print Format", "Existing RFP").html
						rfp_template = frappe.render_template(print_format_template, {"data": self,"url":url,"ngo_name":row.full_name,"deadline":formatted_deadline_date})
						
						frappe.sendmail(
							recipients=row.email,
							subject=f"Invitation to Submit Proposal – {self.title}",
							message=rfp_template,
							now=True
						)

						row.status = "Sent"
						row.save()
					else:
						frappe.throw("Print Format 'Existing RFP' not found")	
			
			level1_users = []  # Array
			level2_users = []  # Array
			level3_users = []  # Array
			arr = self.mark_child_table_changes("table_aycd")
			for row in arr:
				if row.status == "New":
					if row.approver_level == "Level 1":
						level1_users.append(row.user)
					elif row.approver_level == "Level 2":
						level2_users.append(row.user)
					elif row.approver_level == "Level 3":
						level3_users.append(row.user)

				elif row.status == "Deleted":
					if row.approver_level == "Level 1":
						try:
							level1_users.remove(row.user)
						except ValueError:
							pass
					elif row.approver_level == "Level 2":
						try:
							level2_users.remove(row.user)
						except ValueError:
							pass
					elif row.approver_level == "Level 3":
						try:
							level3_users.remove(row.user)
						except ValueError:
							pass

				elif row.status == "Updated":
					if row.approver_level == "Level 1":
						if row.user not in level1_users:
							level1_users.append(row.user)
					elif row.approver_level == "Level 2":
						if row.user not in level2_users:
							level2_users.append(row.user)
					elif row.approver_level == "Level 3":
						if row.user not in level3_users:
							level3_users.append(row.user)

			if len(level1_users) or len(level2_users) or len(level3_users):
				proposals = frappe.get_all(
					"Proposal", 
					filters={"rfp": self.name, "docstatus": ["!=", 1]}, 
					fields=["name"]
				)

				for name in proposals:
					proposal = frappe.get_doc("Proposal", name)

					if len(level1_users):
						proposal.level_1_users = [frappe.get_doc({"doctype": "Level 1 User Child","parent": proposal.name,"parentfield": "level_1_users","parenttype": "Proposal","user": user}).save(ignore_permissions=True) for user in level1_users]
					else:
						proposal.level_1_users = []	
					if len(level2_users):
						proposal.level_2_users = [frappe.get_doc({"doctype": "Level 2 User Child","parent": proposal.name,"parentfield": "level_2_users","parenttype": "Proposal","user": user}).save(ignore_permissions=True) for user in level2_users]
					else:
						proposal.level_2_users = []
					if len(level3_users):
						proposal.level_3_users = [frappe.get_doc({"doctype": "Level 3 User Child","parent": proposal.name,"parentfield": "level_3_users","parenttype": "Proposal","user": user}).save(ignore_permissions=True) for user in level3_users]
					else:
						proposal.level_3_users = []

					proposal.save()
			else:
				proposals = frappe.get_all(
					"Proposal", 
					filters={"rfp": self.name, "docstatus": ["!=", 1]}, 
					fields=["name"]
				)

				for name in proposals:
					proposal = frappe.get_doc("Proposal", name)
					proposal.level_1_users = []
					proposal.level_2_users = []
					proposal.level_3_users = []
					proposal.save()



import frappe
def format_sql_tuple(values):
    return f"({', '.join([frappe.db.escape(v) for v in values])})" if values else "('EMPTY_VALUE')"
def list_query(user):
    if not user:
        user = frappe.session.user
    if user != "Administrator":
        role_profile = frappe.db.get_value("SVA User", {'email':user}, "role_profile")
        if role_profile:
            belonging = frappe.db.get_value("Role Profile", role_profile, "custom_belongs_to")
            if belonging == "NGO":
                users_ngo = frappe.get_list(
                    "User Permission", 
                    filters={"user": user, "allow": "NGO"}, 
                    pluck="for_value",
                    ignore_permissions=True
                )
                if len(users_ngo) == 0:
                    return ""
                ngos_grants = frappe.get_list(
                    "Grant", 
                    filters={"ngo": ["in", users_ngo]}, 
                    pluck="name",
                    limit=1000,
                    ignore_permissions=True
                )
                ngos_proposals = frappe.get_list(
                    "Proposal", 
                    filters={"ngo": ["in", users_ngo]}, 
                    pluck="name",
                    limit=1000,
                    ignore_permissions=True
                )
                
                return f"""
                    (
                        (`tabToDo`.reference_type = 'Proposal' 
                        AND `tabToDo`.reference_name IN {format_sql_tuple(ngos_proposals)})
                    OR 
                        (`tabToDo`.reference_type = 'Grant' 
                        AND `tabToDo`.reference_name IN {format_sql_tuple(ngos_grants)})
                    OR 
                        (`tabToDo`.reference_type = 'NGO' 
                        AND `tabToDo`.reference_name IN {format_sql_tuple(users_ngo)})
                    OR 
                        (`tabToDo`.allocated_to = '{user}')
                    OR 
                        (`tabToDo`.owner = '{user}')
                    )
                """
            elif belonging == "Donor":
                users_donor = frappe.get_list(
                    "User Permission", 
                    filters={"user": user, "allow": "Donor"}, 
                    pluck="for_value",
                    ignore_permissions=True
                )
                if len(users_donor) == 0:
                    return ""
                donors_grants = frappe.get_list(
                    "Grant", 
                    filters={"donor": ["in", users_donor]}, 
                    pluck="name",
                    limit=1000,
                    ignore_permissions=True
                )
                donors_proposals = frappe.get_list(
                    "Proposal", 
                    filters={"donor": ["in", users_donor]}, 
                    pluck="name",
                    limit=1000,
                    ignore_permissions=True
                )
                
                return f"""
                    (
                        (`tabToDo`.reference_type = 'Proposal' 
                        AND `tabToDo`.reference_name IN {format_sql_tuple(donors_proposals)})
                    OR 
                        (`tabToDo`.reference_type = 'Grant' 
                        AND `tabToDo`.reference_name IN {format_sql_tuple(donors_grants)})
                    OR 
                        (`tabToDo`.reference_type = 'Donor' 
                        AND `tabToDo`.reference_name IN {format_sql_tuple(users_donor)})
                    OR 
                        (`tabToDo`.allocated_to = '{user}')
                    OR 
                        (`tabToDo`.owner = '{user}')
                    )
                """
    return ""
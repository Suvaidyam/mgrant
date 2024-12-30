import frappe
def input_on_validate(self):
    pass
    # year_type = frappe.db.get_single_value("mGrant Settings", "year_type") or "Financial Year"
    # if frappe.db.exists("mGrant Settings Grant Wise",self.grant):
    #     msgw = frappe.db.get_doc("mGrant Settings Grant Wise",self.grant)
    #     if msgw.year_type:
    #         year_type = msgw.year_type
    # if year_type == "Calendar Year":
    #     self.q1_target = float(self.get('jan_target') or 0) + float(self.get('feb_target') or 0) + float(self.get('mar_target') or 0)
    #     self.q2_target = float(self.get('apr_target') or 0) + float(self.get('may_target') or 0) + float(self.get('jun_target') or 0)
    #     self.q3_target = float(self.get('jul_target') or 0) + float(self.get('aug_target') or 0) + float(self.get('sep_target') or 0)
    #     self.q4_target = float(self.get('oct_target') or 0) + float(self.get('nov_target') or 0) + float(self.get('dec_target') or 0)
    #     self.q1_achievement = float(self.get('jan_achievement') or 0) + float(self.get('feb_achievement') or 0) + float(self.get('mar_achievement') or 0)
    #     self.q2_achievement = float(self.get('apr_achievement') or 0) + float(self.get('may_achievement') or 0) + float(self.get('jun_achievement') or 0)
    #     self.q3_achievement = float(self.get('jul_achievement') or 0) + float(self.get('aug_achievement') or 0) + float(self.get('sep_achievement') or 0)
    #     self.q4_achievement = float(self.get('oct_achievement') or 0) + float(self.get('nov_achievement') or 0) + float(self.get('dec_achievement') or 0)
    # else:
    #     self.q1_target = float(self.get('apr_target') or 0) + float(self.get('may_target') or 0) + float(self.get('jun_target') or 0)
    #     self.q2_target = float(self.get('jul_target') or 0) + float(self.get('aug_target') or 0) + float(self.get('sep_target') or 0)
    #     self.q3_target = float(self.get('oct_target') or 0) + float(self.get('nov_target') or 0) + float(self.get('dec_target') or 0)
    #     self.q4_target = float(self.get('jan_target') or 0) + float(self.get('feb_target') or 0) + float(self.get('mar_target') or 0)
    #     self.q1_achievement = float(self.get('apr_achievement') or 0) + float(self.get('may_achievement') or 0) + float(self.get('jun_achievement') or 0)
    #     self.q2_achievement = float(self.get('jul_achievement') or 0) + float(self.get('aug_achievement') or 0) + float(self.get('sep_achievement') or 0)
    #     self.q3_achievement = float(self.get('oct_achievement') or 0) + float(self.get('nov_achievement') or 0) + float(self.get('dec_achievement') or 0)
    #     self.q4_achievement = float(self.get('jan_achievement') or 0) + float(self.get('feb_achievement') or 0) + float(self.get('mar_achievement') or 0)
    # self.total_target = float(self.get('q1_target') or 0) + float(self.get('q2_target') or 0) + float(self.get('q3_target') or 0) + float(self.get('q4_target') or 0)
    # self.total_achievement = float(self.get('q1_achievement') or 0) + float(self.get('q2_achievement') or 0) + float(self.get('q3_achievement') or 0) + float(self.get('q4_achievement') or 0)
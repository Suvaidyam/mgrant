def output_on_validate(self):
    if self.frequency in ('Quarterly', 'Monthly','Annually'):
        self.total_target = sum([item.get('target',0) or 0 for item in self.planning_table if len(self.planning_table) > 0])
        self.total_achievement = sum([item.get('achievement',0) or 0 for item in self.planning_table if len(self.planning_table) > 0])
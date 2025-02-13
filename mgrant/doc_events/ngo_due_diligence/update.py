class Update:
    def on_update(self, doc):
        print("[on_update]", doc.name)
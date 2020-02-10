export default Ember.Component.extend({
  validTypes: Ember.String.w("date dropdown tags text textarea upload users"),
  classNames: ["ntf-field"],

  actions: {
    removeField() {
      this.sendAction("removeField", this.get("model"));
    }
  }
});

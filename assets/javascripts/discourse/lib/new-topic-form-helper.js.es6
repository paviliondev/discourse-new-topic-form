export function confirmAction(message, callback) {
  const i18nPath = "new_topic_form";
  const buttons = [
    {
      label: I18n.t(i18nPath + ".nay"),
      link: true
    },
    {
      label: I18n.t(i18nPath + ".yay"),
      class: "btn-danger",
      callback
    }
  ];

  bootbox.dialog(message, buttons);
}

'use strict'

let i18n
// i18n key prefix for MUC ("muc.") or 1:1 chat ("chat.")
let key_prefix

// load i18n and perform translation
i18n = new I18nText({ path: 'lang' })
i18n.on(I18nText.event.LOCALE_CHANGE, function (data) {
  document.getElementById('lang-picker').value = data.locale
  let rtlLangs = 'ar, fa, he, ur'
  if (rtlLangs.includes(data.locale)) {
    document.querySelector('body').dir = 'rtl'
  }
  rehash()
})

let setLocale = false
for (let preferredLocale of navigator.languages) {
  if (supportedLocales.includes(preferredLocale)) {
    i18n.setLocale(preferredLocale)
    setLocale = true
    break
  }
}

if (!setLocale) {
  i18n.setLocale(defaultLocale)
}

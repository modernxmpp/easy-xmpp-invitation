'use strict'

let i18n
// i18n key prefix for MUC ("muc.") or 1:1 chat ("chat.")
let key_prefix

// load i18n and perform translation
i18n = new I18nText({ path: 'lang' })
let langPicker = document.getElementById('lang-picker')
i18n.on(I18nText.event.LOCALE_CHANGE, data => {
  langPicker.value = data.locale
  let rtlLangs = 'ar, fa, he, ur'
  if (rtlLangs.includes(data.locale)) {
    document.querySelector('body').dir = 'rtl'
  }
  rehash()
})

// get available locales from lang picker
let availableLocales = new Set();
for (const option of langPicker.options) {
	availableLocales.add(option.value);
}

let setLocale = false
for (let preferredLocale of navigator.languages) {
  if (availableLocales.has(preferredLocale)) {
    i18n.setLocale(preferredLocale)
    setLocale = true
    break
  }
}

if (!setLocale) {
  i18n.setLocale(defaultLocale)
}

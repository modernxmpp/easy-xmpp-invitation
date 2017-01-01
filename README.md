# XMPP Invitation Landing Page

This is an XMPP invitation landing page you can host yourself. Use it to send
XMPP invitations (contact or chat room) to people who do not have an XMPP
client yet.

Principal operation:

 * User A clicks on the client's "Create Invitation" button
    * The XMPP client creates a link according to [RFC 5122](https://tools.ietf.org/html/rfc5122), e.g. `xmpp:me@xmpp.example?otr=23`
    * The client automatically transforms the link into a landing page link by removing `xmpp:` and adding the address as an URI fragment to the hosted landing page, e.g. `https://www.xmpp.example/i/#me@xmpp.example?otr=23`
 * User A sends the resulting invitation link via E-Mail, SMS, QR-Code, [RFC 1149](https://tools.ietf.org/html/rfc1149) or any other means.
 * User B opens the link in the browser, which has an "Add"/"Join" button linking to the `xmpp:` URI
   * If user B has an XMPP client, it will handle the button click
   * If user B does not have an XMPP client, they can install one and return to the link later

Design decisions:

 * The (privacy sensitive) JID and parameters are put into the URI fragment, which is not transmitted to the hosting server
 * The fragment is parsed by the receiving client, this requires JavaScript
 * I18N and client suggestions are performed dynamically
 * MUCs get a special treatment in the UI to show they are a chat room and not a contact, based on presence of `?join` in the address


TODO:

 * I18N / Translation
   * Browser language auto-detection
   * More languages
 * Plattform specific client recommendations (i.e. yaxim on Android, ChatSecure on iOS, Gajim on Windows)
 * "Edit" mode to manually create invitation links

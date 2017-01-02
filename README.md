# Easy XMPP Invitation Landing Page

This is an XMPP invitation landing page that client developers or XMPP server
admins can host on their servers. It allows users to send XMPP invitations
(contacts or chat rooms) to people who do not have an XMPP client yet. This is
part of the [Easy XMPP](https://wiki.xmpp.org/web/Easy_XMPP) initiative to
improve the ["first contact"](https://wiki.xmpp.org/web/Easy_Onboarding#First_Contact)
experience.

For the JID vladimir@xmpp.example, it will create the following page ([live example](https://yax.im/i/#vladimir@xmpp.example)):

> ## Vladimir has invited you to chat
> 
> Add Vladimir to your contact list by clicking the following link:
>
>   [**[ Add Vladimir ]**](https://yax.im/i/#vladimir@xmpp.example)
> 
> If this link does not work, you need to install and configure an XMPP client, and visit this page again afterwards.
> 
> *[snipped client list and disclaimer]*


## Principal operation

 * Vladimir clicks on his XMPP client's "Create Invitation" button
    * The XMPP client creates a link according to [RFC 5122](https://tools.ietf.org/html/rfc5122), e.g. `xmpp:vladimir@xmpp.example?otr=23`
    * The client automatically transforms the link into a landing page link by removing `xmpp:` and adding the address as an URI fragment to the hosted landing page, e.g. `https://www.xmpp.example/i/#vladimir@xmpp.example?otr=23`
 * Vladimir sends the resulting invitation link via E-Mail, SMS, QR-Code, [RFC 1149](https://tools.ietf.org/html/rfc1149) or any other means to user Donald.
 * Donald opens the link in the browser, which has an "Add"/"Join" button linking to the `xmpp:` URI
   * If Donald has an XMPP client, it will handle the button click and open the "Add to roster" dialog
   * If Donald does not have an XMPP client, the link won't work. Donald must install a client and return to the link later

## Design decisions

 * The (privacy sensitive) JID and parameters are put into the URI fragment, which is not transmitted to the hosting server
 * The fragment is parsed by the receiving client, this requires JavaScript
 * I18N and client suggestions are performed dynamically
 * MUCs get a special treatment in the UI to show they are a chat room and not a contact, based on presence of `?join` in the address


## TODO

 * I18N / Translation
   * Browser language auto-detection, drop-down / language list for manual override
   * More languages
 * Plattform specific client recommendations (i.e. yaxim on Android, ChatSecure on iOS, Gajim on Windows)
   * Option to switch plattform dynamically
 * "Edit" mode to manually create invitation links
 * Get rid of bootstrap

## Inspiration

This project was inspired by
[mod_invite](https://modules.prosody.im/mod_invite.html) and
[Conversations'](https://conversations.im/) contact sharing page.

## License

T.B.D.

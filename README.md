# Easy XMPP Invitation Landing Page

This is an XMPP invitation landing page that client developers or XMPP server
admins can host on their servers. It allows users to send XMPP invitations
(contacts or chat rooms) to people who do not have an XMPP client yet. This is
part of the [Easy XMPP](https://wiki.xmpp.org/web/Easy_XMPP) initiative to
improve the ["first contact"](https://wiki.xmpp.org/web/Easy_Onboarding#First_Contact)
experience.

For the JID romeo@montague.lit, it will create the following page ([live example](https://xmpp.link/#romeo@montague.lit)):

> ## Romeo has invited you to chat
> 
> Add Romeo to your contact list by clicking the following link:
>
>   [**[ Add Romeo ]**](https://xmpp.link/#romeo@montague.lit)
> 
> If this link does not work, you need to install and configure an XMPP client, and visit this page again afterwards.
> 
> *[snipped client list and disclaimer]*

The project's official hosted landing page is at [xmpp.link](https://xmpp.link/).

## Principal operation

 * Romeo clicks on his XMPP client's "Create Invitation" button
    * The XMPP client [requests an invitation URI from the server](https://xmpp.org/extensions/xep-0401.html) or creates a link according to [RFC 5122](https://datatracker.ietf.org/doc/html/rfc5122), e.g., `xmpp:romeo@montague.lit?otr=23`
    * The client automatically transforms the link into a landing page link by removing `xmpp:` and adding the address as a URI fragment to the hosted landing page, e.g., `https://xmpp.link/#romeo@montague.lit?otr=23`
 * Romeo sends the resulting invitation link via email, text message, QR code, [RFC 1149](https://datatracker.ietf.org/doc/html/rfc1149) or any other means to the user Juliet
 * Juliet opens the link in a web browser and the displayed page contains an "Add" or "Join" button with the `xmpp:` URI
   * If Juliet has an XMPP client, it will handle the button click and open the "Add to roster" dialog
   * If Juliet does not have an XMPP client, the link won't work. Juliet must install a client and return to the link later

## Design decisions

 * The (privacy-sensitive) JID and the parameters are put in the URI fragment which is not transmitted to the hosting server
 * The fragment is parsed by the receiving client, this requires JavaScript
 * I18N and client suggestions are performed dynamically
 * There are three special cases in the UI with distinct display strings:
   - `chat` - a contact invitation
   - `muc` - a MUC invitation, with a `?join` URI parameter
   - `register` - an account registration invitation with `?register`
 * The list of clients is a small, opinionated selection of what is useful for a new user on the respective platform (and yaxim 😉), it is not meant to be a comprehensive list of all existing implementations.

## Setup

The following steps are needed to get started:

1. Create a copy of `config.dist.js` in the same directory, rename it to `config.js` and adjust it to your needs
1. Open `index.html` in your web browser
1. Append `#` and the JID you want to create the invitation for to the URL

## App Developers

Some operating systems require to verify "ownership" or at least collaboration from the landing page in order to directly launch an (already installed) XMPP client.
On Google, this is called [App Links](https://developer.android.com/training/app-links/configure-assetlinks) and requires storing the signing key hashes in `.well-known/assetlinks.json`.

For platforms that allow coexistence of multiple XMPP apps, we accept pull requests from app authors with the respective addition, with an explanation of the keys in the commit message.


## TODO

 * I18N / Translation
   * Drop-down / language list for manual override
   * More languages
 * Platform specific client recommendations:
   * Option to switch platform dynamically

## Inspiration

This project was inspired by
[mod_invite](https://modules.prosody.im/mod_invite.html) and
[Conversations'](https://conversations.im/) contact sharing page.

## License

This code is licensed under the MIT License.

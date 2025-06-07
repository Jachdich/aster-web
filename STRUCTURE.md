App
 ├─ PageLogin
 ├─ PageLoading
 ├─ PageMain
 │   ├─ DialogTheme
 │   ├─ DialogAddServer
 │   ├─ DialogAccount
 │   ├─ PanelServerList
 │   │   └─ ServerListButton
 │   └─ PanelServerView
 │       ├─ DialogServerProfile
 │       ├─ DialogKeybinds
 │       ├─ ServerMessage
 │       └─ PanelChannelList
 │          └─ ChannelListButton
 ├─ DialogChangelog
 └─ Context Menu


CSS PREFIXES:
    - con - container
    - pan - panel
    - lab - label
    - btn - button
    - inp - input
    - gra - graphic (img, svg)


CSS CLASS LAYOUT {
    (height & width)
    (positioning styles)
    (flex/display styles)
    (margins)
    (padding)
    (color)
    (background color)
    (border styles)
    (font-styles)
    (other)
}

CSS NEW
-------

app.css
    (body html main input textarea button select hr a)
    #app
    .pixel-img
    .con-dialog-row (p span input button)

App
    .lab-version-number

PageLogin.svelte
    .con-login-input
    .gra-login-logo
    .con-login
    .pan-login
    .inp-login
    .btn-login
    .lab-splash-text

PageMain
    .con-main
        .con-sidebar
            .con-top-buttons
                .btn-aster
                    #gra-main-logo
                .btn-add-server
                .btn-account
        .con-channel-edge-separator

PanelServerView
    .con-server-area
        .pan-server-channels
            .con-server-info
                .lab-server-info
                .btn-server-profile
        .pan-server-messages
            .con-message-area
            .con-message-input
                .inp-message
            .con-channel-toggle
                .btn-channel-list

ServerListButton
    .con-btn-server
        .btn-server
            .con-sever-name
                .gra-server-icon
                .lab-server-name
            .lab-server-tagline

ServerMessage
    .con-message
        .gra-message-pfp
        .lab-message-username
        .con-message-body
            .lab-message-username-mobile
        .con-message-image
            .gra-message-image
        .lab-message-date-mobile
        .lab-message-date

PanelChannelList
    .con-channel-list

PanelServerList
    .con-server-list

Dialog
    .pan-bg-darken
        #gra-dialog-logo
        .pan-dialog
        .lab-dialog-title
        .con-dialog-content
        .con-dialog-buttons
            .btn-dialog-exit

DialogAccount
    #pan-dialog-account
        .gra-account-pfp
        .con-account-pfp
            .gra-account-pfp
            .btn-account-pfp

DialogAddServer
    #pan-dialog-addserver

DialogChangelog
    #pan-dialog-changelog
    .con-changelog-scrollbox

DialogKeybinds
    #pan-dialog-keybinds
    .lab-keybind

DialogServerProfile
    #pan-dialog-serverprofile
        .con-serverprofile-pfp
            .gra-serverprofile-pfp
            .btn-serverprofile-pfp

DialogTheme
    #pan-dialog-theme
        .btn-theme-file
        .inp-select-lang

ChannelListButton
    .btn-channel

ContextMenu
    (*)
    .pan-conmenu (ul li button i hr)
        .lab-conmenu-shortcut
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
 ├─ DialogChangelog
 └─ Context Menu


CSS PREFIXES:
    - con - container
    - pan - panel
    - lab - label
    - btn - button
    - inp - input
    - gra - graphic (img, svg)


CSS NEW
----------

app.css
    #app
    .pixel-img
    .con-dialog-row (p span input button)

App
    #lab-version-number

PageLogin.svelte
    .con-login-input
    .con-login-input
    #gra-login-logo
    #con-login
    #pan-login
    .inp-login
    .btn-login
    #lab-splash-text

PageMain

Dialog
    #pan-bg-darken
    #gra-logo
    .pan-dialog
    .con-dialog-content
    #lab-dialog-title
    .con-dialog-buttons
    .btn-dialog-exit

DialogAccount
    #pan-dialog-account
    #con-account-pfp
    #btn-account-file
    #gra-account-pfp

DialogAddServer
    #pan-dialog-addserver

DialogChangelog
    #pan-dialog-changelog
    #con-changelog-scrollbox

DialogKeybinds
    #pan-dialog-keybinds
    .lab-keybind

DialogServerProfile
    #pan-dialog-serverprofile
    #con-serverprofile-pfp
    #btn-serverprofile-file
    #gra-serverprofile-pfp

DialogTheme
    #pan-dialog-theme
    #inp-select-lang

CSS OUTLINE
-----------

app.css
    #app
    .pixel-img

App.svelte
    #error .popup .centre-window
        #error-dismiss
    #label-version-number
 
 ├─ PageLogin.svelte
        #login-window
            #logo
            #login
                .input-container
                    .login-input-label
                    .login-input #login-sync-port-input
                .input-container
                    .login-input-label
                    .login-input #login-sync-port-input
                .input-container
                    .login-input #login-uname-input
                .input-container
                    .login-input #login-pword-input
                .input-container
                    .login-button
                    .login-button
            #splash-text

├─  PageMain.svelte
        #page
            #sidebar
                #top-buttons
                    #aster-button
                    #add-server
                    #account
            #channel-edge-separator

├─  DialogTheme.svelte
        #bg-darken
            #logo
            #theme-editor-dialog .popup .centre-window
                .input-container
                    #title
                .input-container
                    .picker-dark
                ... (x8)
                .input-container
                    .picker-dark
                        #lang-select
                .input-container
                    #cancel
             
├─  DialogAddServer.svelte
        #bg-darken
            #add-server-dialog .popup .centre-window
                .input-container
                    #title
                .input-container
                    #n_t_ip
                    #n_ip
                .input-container
                    #n_t_port
                    #n_port
                .input-container
                    #n_cancel
                    #n_okay

├─  DialogAccount.svelte
        #bg-darken
            #add-server-dialog .popup .centre-window
                .input-container
                    #title
                .input-container
                    #pfp-image
                    #pfp-button
                    #file-button
                .input-container
                .input-container
                .input-container
                    #cancel
                    #ok

├─  PanelServerList.svelte
        #server-list

├─  ServerListButton.svelte
        .outer
            .server-button
                #title-block
                    .server-icon
                    .name
                #server-tagline
                #server-info

├─  PanelServerView.svelte
        #server-area
            #server-channels .container
                #server-info
                    #server-ip
                    .server-info-text
                #server-profile-button
            #messages-edge-separator
            #server-messages .container
                #message-area
                #message-input-container
                    #message-input
                #toggle-container
                    #channel-list-button
            
├─  DialogServerProfile.svelte
        #bg-darken
            #server-profile-dialog .popup .centre-window
                .input-container
                    #title
                .input-container
                .input-container
                .input-container
                    #cancel
                    #ok

├─  DialogKeybinds.svelte
        #bg-darken
            #keybinds-dialog .popup .centre-window
                .input-container
                    #title
                .keybind
                    .keybind-text
                    .keybind-label
                ... (x3)
                .input-container
                    #n_cancel

├─  ServerMessage.svelte
        .message
            .message-pfp
            .message-username
            .message-body
                .message-username-mobile
                .image-container
                    .embed-image
                .message-date-mobile
            .message-date

├─  PanelChannelList.svelte
        #channel-list

├─  DialogChangelog.svelte
        #bg-darken
            #changelog-dialog .popup .centre-window
                .input-container
                    #title
                #scroll-box
                .input-container
                    #n_cancel

├─  ContextMenu.svelte
        .navbar
            .shortcut
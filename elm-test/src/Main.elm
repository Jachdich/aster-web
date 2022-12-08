module Main exposing (..)

import Array exposing (Array)
import Browser
import Html exposing (Html, button, div, h1, img, input, label, text, ul)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick, onInput)
import Maybe exposing (Maybe, andThen)


main =
    Browser.sandbox { init = init, update = update, view = view }


type PageState
    = Login
    | Loading
    | Home


type alias Message =
    { uuid : String, content : String, author_uuid : String, date : Int }


type alias Channel =
    { uuid : String, name : String, messages : Array Message }


type alias Server =
    { name : String
    , ip : String
    , port_ : Int
    , channels : Array Channel
    , selected_channel : Int
    }


type alias Model =
    { state : PageState
    , sync_ip : String
    , sync_port : String
    , uname : String
    , password : String
    , servers : Array Server
    , selected_server : Maybe Int
    }


init =
    { state = Login
    , sync_port = "2345"
    , sync_ip = ""
    , uname = ""
    , password = ""
    , servers =
        Array.fromList
            [ { name = "Cospox"
              , ip = "cospox.com"
              , port_ = 2345
              , channels =
                    Array.fromList
                        [ { uuid = "idk"
                          , name = "#test-channel"
                          , messages =
                                Array.fromList
                                    [ { uuid = "asd", content = "Test message content", author_uuid = "idk2", date = 1670111172 }
                                    ]
                          }
                        ]
              , selected_channel = 0
              }
            ]
    , selected_server = Nothing
    }


type Msg
    = LoginClicked
    | RegisterClicked
    | SyncIpChanged String
    | SyncPortChanged String
    | UnameChanged String
    | PasswordChanged String
    | ServerClicked Server
    | ChannelClicked Channel


update : Msg -> Model -> Model
update msg model =
    case msg of
        LoginClicked ->
            { model | state = Home }

        RegisterClicked ->
            { model | state = Home }

        SyncPortChanged text ->
            { model | sync_port = text }

        SyncIpChanged text ->
            { model | sync_ip = text }

        UnameChanged text ->
            { model | uname = text }

        PasswordChanged text ->
            { model | password = text }

        ServerClicked server ->
            let
                idx = List.head (List.filter )
            in
            { model | selected_server = idx }

        ChannelClicked channel ->
            case model.selected_server of
                Just sel_server ->
                    let
                        server =
                            { sel_server | selected_channel = Just channel }
                    in
                    { model | selected_server = Just server }

                Nothing ->
                    model


form_entry : String -> (String -> Msg) -> String -> String -> String -> List (Html Msg)
form_entry val message base_id label_text placeholder_text =
    let
        id1 =
            base_id ++ "_label"

        id2 =
            base_id ++ "_input"
    in
    [ label [ id id1, for id2 ] [ text label_text ]
    , input
        [ id id2
        , placeholder placeholder_text
        , class "login_input"
        , required True
        , value val
        , onInput message
        , type_
            (case base_id of
                "pw" ->
                    "password"

                _ ->
                    "text"
            )
        ]
        []
    ]


server_header : String -> List (Html Msg)
server_header name =
    [ h1 [ class "server-name" ] [ text name ]
    , div [ class "user-indicator" ] []
    , h1 [ id "server-user-label", class "server-status-label" ] [ text "N/A online" ]
    , img [ src "/assets/ping.png", class "ping-indicator" ] []
    , h1 [ id "server-ping-label", class "server-status-label" ] [ text "N/Ams" ]
    , div [ class "server-header-seperator" ] []
    , button [ id "server-notifs" ]
        [ img [ src "/assets/bell.png", class "icon-small" ] []
        ]
    ]


get_server_html : Server -> Html Msg
get_server_html server =
    div [ class "server-module" ]
        [ button [ onClick (ServerClicked server) ]
            [ img [ src "/assets/cospox.png", class "server-icon" ] [] ]
        , div [ class "module-user-indicator" ] []
        , img [ src "/assets/server_select.png", class "server-selection-indicator" ] []
        ]


get_channel_html : Channel -> Html Msg
get_channel_html channel =
    button [ onClick (ChannelClicked channel), attribute "value" "0", class "channel-button" ] [ text channel.name ]


channel_list_html : Model -> List (Html Msg)
channel_list_html model =
    case get_selected_server model of
        Just server ->
            Array.toList (Array.map get_channel_html server.channels)

        Nothing ->
            []


get_message_html : Message -> Html Msg
get_message_html message =
    div [] [ text (message.author_uuid ++ ": " ++ message.content) ]


get_selected_server : Model -> Maybe Server
get_selected_server model =
    model.selected_server
        |> andThen (\idx -> Array.get idx model.servers)


get_selected_channel : Model -> Maybe Channel
get_selected_channel model =
    model.selected_server
        |> andThen (\idx -> Array.get idx model.servers)
        |> andThen (\serv -> Array.get serv.selected_channel serv.channels)


view : Model -> Html Msg
view model =
    div []
        (case model.state of
            Login ->
                [ div [ id "login" ]
                    (List.concat
                        [ form_entry model.sync_ip SyncIpChanged "sync_ip" "Sync server IP" "Enter IP"
                        , form_entry model.sync_port SyncPortChanged "sync_port" "Sync server port" "Enter port"
                        , form_entry model.uname UnameChanged "uname" "Username" "Enter username"
                        , form_entry model.password PasswordChanged "pw" "Password" "Enter password"
                        , [ button [ onClick RegisterClicked ] [ text "Register" ]
                          , button [ onClick LoginClicked ] [ text "Log in" ]
                          ]
                        ]
                    )
                ]

            Loading ->
                [ div [] [ text "Loading..." ] ]

            Home ->
                [ div [ id "idkwhatthisis" ]
                    [ div [ class "top" ]
                        [ div [ class "server-list", id "server-list" ]
                            (Array.toList (Array.map get_server_html model.servers))
                        , button [ id "add-server" ] [ img [ src "/assets/add.png", class "icon" ] [] ]
                        , button [ id "settings" ] [ img [ src "/assets/default_pfp.png", class "pfp", id "pfp_button" ] [] ]
                        ]
                    , div [ class "server-header" ] (server_header "Cospox")
                    , div [ id "server-area" ]
                        [ div [ id "server-channels" ]
                            [ ul [ id "channel-list" ] (channel_list_html model)
                            ]
                        , div [ id "server-chat" ]
                            [ input [ rows 1, autofocus True, id "server-chat-msgbox", placeholder " Send a message" ] []
                            , div [ id "message-area" ]
                                []
                            ]
                        ]
                    ]
                ]
        )

function run() {
  net_init_sockjs();
  map_get_cloudmade_token();
  map_init();
  map_init_watch_my_geo();
  game_ui_slider();
}

function init() {
    document.addEventListener("deviceready", run, true);
}

import { createState, For } from 'ags'
import { Gdk } from 'ags/gtk4'
import { Astal } from 'ags/gtk4'
import app from 'ags/gtk4/app'
import AstalApps from 'gi://AstalApps'
import Gtk from 'gi://Gtk'
import { getSteamBoxArt } from '../utils'

export default function Gamelauncher() {
  let win: Astal.Window
  let searchentry: Gtk.Entry

  const apps = new AstalApps.Apps()
  const [games, setGames] = createState(new Array<AstalApps.Application>())

  function search(text: string) {
    setGames(apps.fuzzy_query(text).filter((a) => !!getSteamBoxArt(a)))
  }

  function launch(game: AstalApps.Application) {
    win.hide()
    game.launch()
  }

  function onKey(_: Gtk.EventControllerKey, keyval: number) {
    if (keyval === Gdk.KEY_Escape) win.hide()
  }

  return (
    <window
      $={(ref) => (win = ref)}
      visible={false}
      name='Gamelauncher'
      keymode={Astal.Keymode.EXCLUSIVE}
      anchor={Astal.WindowAnchor.TOP}
      application={app}
    >
      <Gtk.EventControllerKey onKeyPressed={onKey} />
      <box halign={Gtk.Align.CENTER} orientation={Gtk.Orientation.VERTICAL}>
        <entry
          $={(ref) => (searchentry = ref)}
          onNotifyText={({ text }) => search(text)}
          onActivate={() => launch(games.get()[0])}
        />
        <For each={games}>
          {(game) => (
            <box halign={Gtk.Align.CENTER} spacing={5}>
              <image file={getSteamBoxArt(game)} pixelSize={64} />
              <label label={game.name} maxWidthChars={40} wrap />
            </box>
          )}
        </For>
      </box>
    </window>
  )
}

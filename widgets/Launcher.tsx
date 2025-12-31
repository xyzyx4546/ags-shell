import app from 'ags/gtk4/app'
import { For, createState } from 'ags'
import { Astal, Gtk, Gdk } from 'ags/gtk4'
import AstalApps from 'gi://AstalApps'
import Graphene from 'gi://Graphene'

export default function Launcher() {
  let win: Astal.Window
  let searchentry: Gtk.Entry

  const apps = new AstalApps.Apps()
  const [selected, setSelected] = createState(0)
  const [appList, setAppList] = createState(apps.get_list())

  function search(text: string) {
    setAppList(apps.fuzzy_query(text).slice(0, 5))
    setSelected(Math.min(selected(), Math.max(0, appList().length - 1)))
  }

  function launch(app: AstalApps.Application) {
    if (app) {
      win.hide()
      app.launch()
    }
  }

  function onShow() {
    searchentry.text = ''
    setSelected(0)
    search('')
  }

  function onKey(_: Gtk.EventControllerKey, keyval: number) {
    const ctrlPressed = Gdk.ModifierType.CONTROL_MASK !== 0

    switch (keyval) {
      case Gdk.KEY_Escape:
        win.hide()
        break

      case Gdk.KEY_k:
        if (!ctrlPressed) break
      case Gdk.KEY_Up:
        setSelected(Math.max(selected() - 1, 0))
        break

      case Gdk.KEY_j:
        if (!ctrlPressed) break
      case Gdk.KEY_Down:
        setSelected(Math.min(selected() + 1, appList().length - 1))
        break
    }
  }

  function onClick(_e: Gtk.GestureClick, _: number, x: number, y: number) {
    const [, rect] = win.compute_bounds(win)
    const position = new Graphene.Point({ x, y })

    if (!rect.contains_point(position)) win.visible = false
  }

  return (
    <window
      $={(ref) => (win = ref)}
      name='Launcher'
      namespace='launcher'
      class='launcher'
      monitor={0}
      keymode={Astal.Keymode.EXCLUSIVE}
      application={app}
      onShow={onShow}
    >
      <Gtk.EventControllerKey onKeyPressed={onKey} />
      <Gtk.GestureClick onPressed={onClick} />
      <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
        <entry
          $={(ref) => (searchentry = ref)}
          onNotifyText={({ text }) => search(text)}
          onActivate={() => launch(appList()[selected()])}
        />
        <box class='list' orientation={Gtk.Orientation.VERTICAL}>
          <For each={appList}>
            {(app, index) => (
              <button
                class={selected((s) => `item ${s === index() && 'selected'}`)}
                onClicked={() => launch(app)}
                canFocus={false}
              >
                <box spacing={10}>
                  <image iconName={app.iconName} />
                  <label label={app.name} />
                </box>
              </button>
            )}
          </For>
        </box>
      </box>
    </window>
  )
}

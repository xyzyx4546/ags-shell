import app from 'ags/gtk4/app'
import { With, createState } from 'ags'
import { Astal, Gtk, Gdk } from 'ags/gtk4'
import AstalApps from 'gi://AstalApps'

export default function Applauncher() {
  let win: Astal.Window
  let searchentry: Gtk.Entry

  const apps = new AstalApps.Apps()
  const [selectedApp, setSelectedApp] = createState<AstalApps.Application | undefined>(undefined)

  function search(text: string) {
    if (text === '') setSelectedApp(undefined)
    else setSelectedApp(apps.fuzzy_query(text)[0])
  }

  function launch() {
    let app = selectedApp()
    if (app) {
      win.hide()
      app.launch()
    }
  }

  function onKey(_: Gtk.EventControllerKey, keyval: number) {
    if (keyval === Gdk.KEY_Escape) win.hide()
  }

  return (
    <window
      $={(ref) => (win = ref)}
      visible={false}
      name='Applauncher'
      namespace='applauncher'
      class='applauncher'
      monitor={0}
      keymode={Astal.Keymode.EXCLUSIVE}
      application={app}
      onHide={() => searchentry.text = ''}
    >
      <Gtk.EventControllerKey onKeyPressed={onKey} />
      <Gtk.GestureClick onPressed={() => win.hide()} />
      <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
        <entry
          $={(ref) => (searchentry = ref)}
          onNotifyText={({ text }) => search(text)}
          onActivate={launch}
        />
        <With value={selectedApp}>
          {(app) => app ? (
            <box class='selected-app' spacing={5}>
              <image iconName={app.iconName} />
              <label label={app.name} />
            </box>
          ): (
          <box height_request={32}></box>
          )}
        </With>
      </box>
    </window>
  )
}

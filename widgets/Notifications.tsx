import Gtk from 'gi://Gtk?version=4.0'
import AstalNotifd from 'gi://AstalNotifd'
import Adw from 'gi://Adw'
import Pango from 'gi://Pango'
import { createState, For } from 'ags'
import Astal from 'gi://Astal?version=4.0'
import GLib from 'gi://GLib'

type Props = {
  notification: AstalNotifd.Notification
}

function Notification({ notification: n }: Props) {
  return (
    <Adw.Clamp maximumSize={400}>
      <box
        widthRequest={400}
        class={`notification ${n.urgency === AstalNotifd.Urgency.CRITICAL && 'critical'}`}
        orientation={Gtk.Orientation.VERTICAL}
      >
        <box class='header'>
          {n.desktopEntry && <image iconName={n.desktopEntry} />}
          <label
            class='app-name'
            halign={Gtk.Align.START}
            ellipsize={Pango.EllipsizeMode.END}
            label={n.appName || 'Unknown'}
          />
          <label
            class='time'
            hexpand
            halign={Gtk.Align.END}
            label={GLib.DateTime.new_from_unix_local(n.time).format('%H:%M')!}
          />
        </box>
        <Gtk.Separator visible />
        <box class='content' orientation={Gtk.Orientation.VERTICAL}>
          <label
            class='summary'
            halign={Gtk.Align.START}
            xalign={0}
            label={n.summary}
            ellipsize={Pango.EllipsizeMode.END}
          />
          {n.body && (
            <label
              class='body'
              wrap
              useMarkup
              halign={Gtk.Align.START}
              xalign={0}
              justify={Gtk.Justification.FILL}
              label={n.body}
            />
          )}
        </box>
        {n.actions.length > 0 && (
          <box class='actions'>
            {n.actions.map(({ label, id }) => (
              <button hexpand onClicked={() => n.invoke(id)}>
                <label label={label} halign={Gtk.Align.CENTER} hexpand />
              </button>
            ))}
          </box>
        )}
      </box>
    </Adw.Clamp>
  )
}

export default function Notifications() {
  const notifd = AstalNotifd.get_default()
  const [notifications, setNotifications] = createState(new Array<AstalNotifd.Notification>())

  notifd.connect('notified', (_, id, replaced) => {
    const notification = notifd.get_notification(id)
    if (!notification) return

    if (replaced && notifications().some((n) => n.id === id)) {
      setNotifications((ns) => ns.map((n) => (n.id === id ? notification : n)))
    } else {
      setNotifications((ns) => [notification, ...ns])
    }
  })

  notifd.connect('resolved', (_, id) => {
    setNotifications((ns) => ns.filter((n) => n.id !== id))
  })

  return (
    <window
      class='notifications'
      monitor={0}
      visible={notifications((ns) => ns.length > 0)}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
    >
      <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
        <For each={notifications}>
          {(notification) => <Notification notification={notification} />}
        </For>
      </box>
    </window>
  )
}

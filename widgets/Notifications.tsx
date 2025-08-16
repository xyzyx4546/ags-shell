import Gtk from 'gi://Gtk?version=4.0'
import AstalNotifd from 'gi://AstalNotifd'
import Adw from 'gi://Adw'
import Pango from 'gi://Pango'
import { createState, For } from 'ags'
import Astal from 'gi://Astal?version=4.0'

type Props = {
  notification: AstalNotifd.Notification
}

function Notification({ notification: n }: Props) {
  const notifd = AstalNotifd.get_default()

  return (
    <Adw.Clamp maximumSize={400}>
      <Gtk.GestureClick onPressed={() => n.dismiss()} />
      <Gtk.GestureClick onPressed={() => notifd.notifications.forEach((n) => n.dismiss())} />
      <box widthRequest={400} class={'notification'} spacing={10}>
        {n.image && <image class='image' file={n.image} />}
        <box orientation={Gtk.Orientation.VERTICAL}>
          <box>
            <label class='title' ellipsize={Pango.EllipsizeMode.END} label={n.summary} />
            <image
              visible={Boolean(n.desktopEntry)}
              hexpand
              halign={Gtk.Align.END}
              valign={Gtk.Align.START}
              pixelSize={22}
              iconName={n.desktopEntry}
            />
          </box>
          <Gtk.Separator visible widthRequest={400} />
          <label
            class='content'
            visible={Boolean(n.body)}
            wrap
            useMarkup
            halign={Gtk.Align.START}
            label={n.body}
          />
        </box>
      </box>
    </Adw.Clamp>
  )
}

export default function Notifications() {
  const notifd = AstalNotifd.get_default()
  const [notifications, setNotifications] = createState(new Array<AstalNotifd.Notification>())

  notifd.connect('notified', (_, id, replaced) => {
    const notification = notifd.get_notification(id)
    if (replaced && notifications.get().some((n) => n.id === id)) {
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

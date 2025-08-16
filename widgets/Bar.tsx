import app from 'ags/gtk4/app'
import GLib from 'gi://GLib'
import Astal from 'gi://Astal?version=4.0'
import Gtk from 'gi://Gtk?version=4.0'
import Gdk from 'gi://Gdk?version=4.0'
import AstalBattery from 'gi://AstalBattery'
import AstalTray from 'gi://AstalTray'
import AstalHyprland from 'gi://AstalHyprland'
import AstalWp from 'gi://AstalWp'
import { For, createBinding, createState } from 'ags'
import { createPoll } from 'ags/time'
import { getBrightness, monitorBrightness } from '../utils'

function Workspaces() {
  const hyprland = AstalHyprland.get_default()
  const workspaces = createBinding(hyprland, 'workspaces').as((wss) =>
    wss.filter((ws) => !(ws.id >= -99 && ws.id <= -2)).sort((a, b) => a.id - b.id),
  )
  const focusedWorkspace = createBinding(hyprland, 'focusedWorkspace')

  return (
    <box class='item workspaces' spacing={10}>
      <For each={workspaces}>
        {(ws) => (
          <button
            onClicked={() => ws.focus()}
            // FIX: doesnt trigger on move of client
            class={createBinding(hyprland, 'clients').as(() =>
              ws.clients.length == 0 ? 'empty' : '',
            )}
          >
            <label label={focusedWorkspace.as((fw) => (ws === fw ? '' : ''))} />
          </button>
        )}
      </For>
    </box>
  )
}

function Tray() {
  const tray = AstalTray.get_default()
  const items = createBinding(tray, 'items').as((items) =>
    items.filter((item) => item.gicon !== null),
  )

  const init = (btn: Gtk.MenuButton, item: AstalTray.TrayItem) => {
    btn.menuModel = item.menuModel
    btn.insert_action_group('dbusmenu', item.actionGroup)
    item.connect('notify::action-group', () => {
      btn.insert_action_group('dbusmenu', item.actionGroup)
    })
  }

  return (
    <box class='item' spacing={3} visible={items.as((items) => items.length > 0)}>
      <For each={items}>
        {(item) =>
          item.gicon && (
            <menubutton $={(self) => init(self, item)}>
              <image gicon={createBinding(item, 'gicon')} />
            </menubutton>
          )
        }
      </For>
    </box>
  )
}

// TODO: Vitals

// TODO: network

// TODO: omit if not supported
function Brightness() {
  const [brightness, setBrightness] = createState(getBrightness())

  monitorBrightness(() => setBrightness(getBrightness()))

  return (
    <box class='item brightness' visible={brightness !== undefined}>
      <image iconName='display-brightness-symbolic' />
      <label label={brightness.as((b) => ` ${b * 100}%`)} />
    </box>
  )
}

function Volume() {
  const { defaultSpeaker: speaker } = AstalWp.get_default()!
  const iconName = createBinding(speaker, 'volumeIcon')
  const percentage = createBinding(speaker, 'volume')

  return (
    <box class='item volume'>
      <image iconName={iconName} />
      <label label={percentage.as((p) => ` ${Math.round(p * 100)}%`)} />
    </box>
  )
}

function Battery() {
  const bat = AstalBattery.get_default()

  return (
    <box class='item battery' visible={createBinding(bat, 'isPresent')}>
      <box>
        <image iconName={createBinding(bat, 'batteryIconName')} />
        <label label={createBinding(bat, 'percentage').as((p) => ` ${Math.floor(p * 100)}%`)} />
      </box>
    </box>
  )
}

function Clock() {
  const time = createPoll('', 1000, () => {
    return GLib.DateTime.new_now_local().format('%a %d %b, %H:%M')!
  })

  return (
    <box class='item clock' spacing={10}>
      <label label={time} />
    </box>
  )
}

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window
      visible
      name='Bar'
      class='bar'
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox>
        <box $type='start' spacing={10}>
          <Workspaces />
          <Tray />
        </box>
        <box $type='end' spacing={10}>
          <Brightness />
          <Volume />
          <Battery />
          <Clock />
        </box>
      </centerbox>
    </window>
  )
}

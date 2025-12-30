import app from 'ags/gtk4/app'
import Gtk from 'gi://Gtk'
import GLib from 'gi://GLib'
import Adw from 'gi://Adw'
import AstalWp from 'gi://AstalWp'
import { Astal } from 'ags/gtk4'
import { createBinding, createState, With } from 'ags'
import { monitorFile, readFile } from 'ags/file'
import { exec } from 'ags/process'

type Mode = 'volume' | 'brightness'

const device = exec(`sh -c 'ls -w1 /sys/class/backlight | head -1'`).trim()
const brightnessFile = `/sys/class/backlight/${device}/brightness`
const maxBrightness = device ? parseInt(readFile(`/sys/class/backlight/${device}/max_brightness`)) : 0

export default function Osd() {
  const { defaultSpeaker: speaker } = AstalWp.get_default()!
  let win: Astal.Window

  const [mode, setMode] = createState<Mode>('volume')
  let timeoutId: GLib.Source | null = null

  function showOsd(m: Mode) {
    setMode(m)
    win.show()
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      win.hide()
      timeoutId = null
    }, 3000)
  }

  const volume = createBinding(speaker, 'volume')
  const volumeIcon = createBinding(speaker, 'volumeIcon')
  const volumePercent = volume.as((p) => `${Math.round(p * 100)}`)

  ;['notify::volume', 'notify::mute'].forEach((signal: string) => {
    let initialized = false
    speaker.connect(signal, () => (initialized ? showOsd('volume') : (initialized = true)))
  })

  const [brightness, setBrightness] = createState(0)
  const brightnessPercent = brightness.as((r) => `${Math.round(r * 100)}`)

  monitorFile(brightnessFile, () => {
    setBrightness(parseInt(readFile(brightnessFile)) / maxBrightness)
    showOsd('brightness')
  })

  return (
    <window
      $={(ref) => (win = ref)}
      visible={false}
      name='Osd'
      namespace='osd'
      class='osd'
      monitor={0}
      anchor={Astal.WindowAnchor.RIGHT}
      layer={Astal.Layer.OVERLAY}
      marginRight={50}
      application={app}
    >
      <With value={mode}>
        {(m) => {
          const isVolume = m === 'volume'
          return (
            <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
              <Adw.Clamp maximumSize={10}>
                <levelbar
                  orientation={Gtk.Orientation.VERTICAL}
                  inverted
                  heightRequest={150}
                  marginTop={5}
                  value={isVolume ? volume : brightness}
                />
              </Adw.Clamp>
              <box spacing={4} halign={Gtk.Align.CENTER} class='osd-label'>
                <image iconName={isVolume ? volumeIcon : 'display-brightness-symbolic'} />
                <label label={isVolume ? volumePercent : brightnessPercent} />
              </box>
            </box>
          )
        }}
      </With>
    </window>
  )
}

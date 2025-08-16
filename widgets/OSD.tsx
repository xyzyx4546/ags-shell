import app from 'ags/gtk4/app'
import Gtk from 'gi://Gtk'
import GLib from 'gi://GLib'
import Adw from 'gi://Adw'
import AstalWp from 'gi://AstalWp'
import { Astal } from 'ags/gtk4'
import { createBinding, createState, With } from 'ags'
import { getBrightness, monitorBrightness } from '../utils'

type Mode = 'volume' | 'brightness'

export default function Osd() {
  const { defaultSpeaker: speaker } = AstalWp.get_default()!
  let win: Astal.Window

  const [mode, setMode] = createState<Mode>('volume')
  let timeoutId: GLib.Source | null = null

  const showOsd = (m: Mode) => {
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
    // HACK: Avoid showing OSD on startup
    let first = true
    speaker.connect(signal, () => {
      if (first) {
        first = false
        return
      }
      showOsd('volume')
    })
  })

  const [brightness, setBrightness] = createState(getBrightness())
  const brightnessPercent = brightness.as((r) => `${Math.round(r * 100)}`)

  monitorBrightness(() => {
    setBrightness(getBrightness())
    showOsd('brightness')
  })

  return (
    <window
      $={(ref) => (win = ref)}
      visible={false}
      name='Osd'
      class='osd'
      anchor={Astal.WindowAnchor.RIGHT}
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

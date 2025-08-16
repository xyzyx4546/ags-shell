import GLib from 'gi://GLib?version=2.0'
import AstalApps from 'gi://AstalApps'
import { exec } from 'ags/process'
import { monitorFile, readFile } from 'ags/file'

export function getSteamBoxArt(app: AstalApps.Application): string | undefined {
  const artPath = GLib.build_filenamev([
    GLib.get_home_dir(),
    '.local',
    'share',
    'Steam',
    'appcache',
    'librarycache',
    getSteamId(app) ?? '',
    'library_600x900.jpg',
  ])
  if (GLib.file_test(artPath, GLib.FileTest.EXISTS)) return artPath
}

export function getSteamId(app: AstalApps.Application): string | undefined {
  const match = app.executable.match(/^steam steam:\/\/rungameid\/(\d+)$/)
  if (!match) return
  return match[1]
}

export function getBrightness() {
  const backlightPath = '/sys/class/backlight'
  const backlight = `${backlightPath}/${exec(`sh -c 'ls -w1 ${backlightPath} | head -1'`)}`
  const maxBrightness = parseInt(readFile(`${backlight}/max_brightness`))
  const brightness = parseInt(readFile(`${backlight}/brightness`))
  return brightness / maxBrightness
}

export function monitorBrightness(callback: () => void) {
  const backlightPath = '/sys/class/backlight'
  const backlight = `${backlightPath}/${exec(`sh -c 'ls -w1 ${backlightPath} | head -1'`)}`
  const brightnessFile = `${backlight}/brightness`
  
  monitorFile(brightnessFile, () => {
    callback()
  })
}

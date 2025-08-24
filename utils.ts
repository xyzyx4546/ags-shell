import GLib from 'gi://GLib?version=2.0'
import AstalApps from 'gi://AstalApps'

export function getSteamId(app: AstalApps.Application): string | undefined {
  const match = app.executable.match(/^steam steam:\/\/rungameid\/(\d+)$/)
  if (!match) return
    return match[1]
}

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

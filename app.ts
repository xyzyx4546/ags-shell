import app from 'ags/gtk4/app'
import style from './scss/style.scss'
import Bar from './widgets/Bar'
import Osd from './widgets/OSD'
import Notifications from './widgets/Notifications'
import AppLauncher from './widgets/Applauncher'

app.start({
  css: style,
  icons: './icons',
  main() {
    app.get_monitors().map(Bar)
    Osd()
    Notifications()
    AppLauncher()
  },
})

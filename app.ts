import app from 'ags/gtk4/app'
import style from './scss/style.scss'
import Bar from './widgets/Bar'
import Osd from './widgets/Osd'
import Notifications from './widgets/Notifications'
import Applauncher from './widgets/Applauncher'

app.start({
  css: style,
  icons: './icons',
  requestHandler(argv, res) {
    const [cmd, arg] = argv
    console.log(cmd)
    switch (cmd) {
      case 'toggle':
        const w = app.get_window(arg)
        if (w) w.visible = !w.visible
        return res('ok')
      default:
        return res('unknown command')
    }
  },
  main() {
    app.get_monitors().map(Bar)
    Osd()
    Notifications()
    Applauncher()
  },
})

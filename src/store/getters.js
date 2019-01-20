const getters = {
  sidebar: state => state.app.sidebar,
  language: state => state.app.language,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  appid: state => state.user.info.appid,
  appkey: state => state.user.info.appkey,
  userinfo: state => state.user.info
}
export default getters

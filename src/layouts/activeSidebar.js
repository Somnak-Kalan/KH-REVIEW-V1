const checkSideBar = (path = '', child = []) => {
  return child.includes(path)
}

const activeSideBar = (path) => {
  return location.pathname
}
//
export default activeSideBar

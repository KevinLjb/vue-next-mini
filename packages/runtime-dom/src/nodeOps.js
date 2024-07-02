const doc = document

export const nodeOps = {
  insert(child, parent, anchor) {
    parent.insertBefore(child, anchor || null)
  },
  createElement(tag) {
    const el = document.createElement(tag)
    return el
  },
  setElementText(el, text) {
    el.textContent = text
  },
  remove(child) {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },
  setText(node, text) {
    node.nodeValue = text
  },
  createText(text) {
    return doc.createTextNode(text)
  },
  createComment(text) {
    return doc.createComment(text)
  }
}

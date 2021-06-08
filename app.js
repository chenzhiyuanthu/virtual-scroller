class VirtualList {
  constructor(config) {
    this.height = (config && config.h + 'px') || '100%';
    let itemHeight = (this.itemHeight = config.itemHeight);
    this.containerId = config.containerId;

    this.items = config.items;
    this.generatorFn = config.generatorFn;
    this.totalRows = config.totalRows || (config.items && config.items.length);

    let totalHeight = itemHeight * this.totalRows;
    this.scroller = VirtualList.createScroller(totalHeight);
    this.container = document.getElementById(this.containerId);

    let screenItemsLen = Math.ceil(config.h / itemHeight);
    let cachedItemsLen = screenItemsLen * 3;
    this._renderChunk(this.container, 0, cachedItemsLen / 2);

    let self = this;
    let lastRepaintY;
    let maxBuffer = screenItemsLen * itemHeight;

    function onScroll(e) {
      let scrollTop = e.target.scrollTop;
      let first = parseInt(scrollTop / itemHeight) - screenItemsLen;
      first = first < 0 ? 0 : first;
      if (!lastRepaintY || Math.abs(scrollTop - lastRepaintY) > maxBuffer) {
        self._renderChunk(self.container, first, cachedItemsLen);
        lastRepaintY = scrollTop;
      }

      e.preventDefault && e.preventDefault();
    }

    this.container.addEventListener('scroll', onScroll);
  }

  _renderChunk(node, fromPos, howMany) {
    let fragment = document.createDocumentFragment();
    fragment.appendChild(this.scroller);

    let finalItem = fromPos + howMany;
    if (finalItem > this.totalRows) finalItem = this.totalRows;

    for (let i = fromPos; i < finalItem; i++) {
      let item;
      if (this.generatorFn)
        item = this.generatorFn(i);
      else {
        if (typeof this.items[i] === 'string') {
          let itemText = document.createTextNode(this.items[i]);
          item = document.createElement('div');
          item.style.height = this.height;
          item.appendChild(itemText);
        }
      }

      item.classList.add('vrow');
      item.style.position = 'absolute';
      item.style.top = i * this.itemHeight + 'px';
      fragment.appendChild(item);
    }

    node.innerHTML = '';
    node.appendChild(fragment);
  }

  static createScroller(h) {
    let scroller = document.createElement('div');
    scroller.style.opacity = 0;
    scroller.style.position = 'absolute';
    scroller.style.top = 0;
    scroller.style.left = 0;
    scroller.style.width = '1px';
    scroller.style.height = h + 'px';
    return scroller;
  }
};

const list = new VirtualList({
  w: 600,
  h: 600,
  itemHeight: 31,
  totalRows: 199,
  generatorFn: row => {
    const el = document.createElement('div');
    el.innerHTML = 'I am row number ' + row;
    el.style.textAlign = 'center';
    el.style.borderBottom = '1px dotted';
    el.style.lineHeight = '31px';
    el.style.width = '600px';
    return el;
  },
  containerId: 'table-container'
});

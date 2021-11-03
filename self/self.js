(function () {
  const uitl = {
    closure(name) {
      return (currentHash) => {
        window.name && window[name](currentHash)
      }
    }
  }

  function Router() {
    this.routes = {}; //保存注册的所有路由
    this.beforeFun = null; //切换前
    this.afterFun = null; // 切换后
    this.routerViewId = "#routerView"; // 路由挂载点 
    this.redirectRoute = null; // 路由重定向的 hash
    this.stackPages = true; // 多级页面缓存
    this.routerMap = []; // 路由遍历
    this.historyFlag = '' // 路由状态，前进，回退，刷新
    this.history = []; // 路由历史
    this.animationName = "fade"
  }
  Router.prototype = {
    init: function (config) {
      let self = this;
      this.routerMap = config ? config.routes : this.routerMap
      this.routerViewId = config ? config.routerViewId: this.routerViewId
      this.stackPages = config ? config.stackPages : this.stackPages
      let name = document.querySelector('#routerView').getAttribute('data-animationName')
      if(name) {
        this.animationName = name
      }
      this.animationName = config ? config.animationName : this.animationName

      if(!this.routerMap.length) {
        let selector = this.routerViewId + '.page'
        let pages = document.querySelectorAll(selector)
        for (let i = 0; i <pages.length; i++ ) {
          let page = pages[i]
          let hash = page.getAttribute('data-hash')
          let name = hash.substr(1)
          let item = {
            path: hash,
            name,
            callback: uitl.closure(name)
          }
          this.routerMap.push(item)
        }

      }

      console.log(this.routerMap)
      this.map()
    },

    // 注册路由
    map() {
      for (let i = 0; i < this.routerMap.length; i++) {
        
      }
    }
  }


  window.Router = Router;
  window.router = new Router();
})()
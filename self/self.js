(function () {
  const uitl = {
    closure(name) {
      return (currentHash) => {
        window.name && window[name](currentHash)
      }
    },
    getParamsUrl: function () {
      var hashDeatail = location.hash.split("?"),
        hashName = hashDeatail[0].split("#")[1], //路由地址
        params = hashDeatail[1] ? hashDeatail[1].split("&") : [], //参数内容
        query = {};
      for (var i = 0; i < params.length; i++) {
        var item = params[i].split("=");
        query[item[0]] = item[1]
      }
      return {
        path: hashName,
        query: query,
        params: params
      }
    },
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
      this.routerViewId = config ? config.routerViewId : this.routerViewId
      this.stackPages = config ? config.stackPages : this.stackPages
      let name = document.querySelector('#routerView').getAttribute('data-animationName')
      if (name) {
        this.animationName = name
      }
      this.animationName = config ? config.animationName : this.animationName

      if (!this.routerMap.length) {
        let selector = this.routerViewId + '.page'
        let pages = document.querySelectorAll(selector)
        for (let i = 0; i < pages.length; i++) {
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


      this.map()
      window.addEventListener('load', function (event) {
        console.log('load')
        self.historyChange(event)
      }, false)
    },
    historyChange(event) {
      // 当前hash
      let currentHash = uitl.getParamsUrl()
      let nameStr = 'router-' + (this.routerViewId) + '-history'
      this.history = window.sessionStorage[nameStr] ? JSON.stringify(window.sessionStorage[nameStr]) : []

      let back = false
      let refresh = false
      let forward = false
      let index = 0
      let len = this.history.length

      for (let i = 0; i < len; i++) {
        let h = this.history[i]
        if (h.hash === currentHash.path && h.key === currentHash.query.key) {
          // 找到当前路由
          index = i
          if (i === len - 1) {
            // 刷新
            refresh = true
          } else {
            // 返回
            back = true
          }
          break
        } else {
          // 新增
          forward = true
        }
      }

      if (back) {
        this.historyFlag = 'black'
      } else if (refresh) {
        this.historyFlag = 'refresh'
      } else {
        this.historyFlag = 'forward'
        let item = {
          key: currentHash.query.key,
          hash: currentHash.path,
          query: currentHash.query
        }
        console.log(item)
        this.history.push(item)
      }
      console.log('historyFlag = ', this.historyFlag)
      if (!this.stackPages) {
        this.historyFlag = 'forward'
      }
      // 存一下
      window.sessionStorage[nameStr] = JSON.stringify(this.history)
      this.urlChange()



    },
    urlChange: function () {
      let currentHash = uitl.getParamsUrl()
      if (this.routes[currentHash.path]) {
        let selt = this
        if (this.beforeFun) {

          this.beforeFun({
            to: {
              path: currentHash.path,
              query: currentHash.query
            },
            next() {
              // self.changeView(currentHash)
            }
          })
        } else {
          this.changeView(currentHash)
        }

      } else {
        location.hash = this.redirectRoute
      }
    },
    // 注册路由
    map() {
      for (let i = 0; i < this.routerMap.length; i++) {
        let route = this.routerMap[i]
        if (route.name === 'redirect') {
          this.redirectRoute = route.path
        } else {
          this.redirectRoute = this.routerMap[0].path
        }
        let newPath = route.path
        let path = newPath.replace(/\s*/g, ""); //过滤空格
        this.routes[path] = {
          callback: route.callback
        }

      }
      console.log(this.routes)
    }
  }


  window.Router = Router;
  window.router = new Router();
})()
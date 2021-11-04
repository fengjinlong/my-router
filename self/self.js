(function () {
  const util = {
    closure(name) {
      return (currentHash) => {
        window.name && window[name](currentHash)
      }
    },
    genKey() {
      var t = 'xxxxxxxx'
      return t.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0
        var v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
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
    hasClass: function (elem, cls) {
      cls = cls || '';
      if (cls.replace(/\s/g, '').length == 0) return false; //当cls没有参数时，返回false
      return new RegExp(' ' + cls + ' ').test(' ' + elem.className + ' ');
    },
    addClass: function (ele, cls) {
      if (!util.hasClass(ele, cls)) {
        ele.className = ele.className == '' ? cls : ele.className + ' ' + cls;
      }
    },
    removeClass(elem, cls) {
      if (util.hasClass(elem, cls)) {
        var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, '') + ' ';
        while (newClass.indexOf(' ' + cls + ' ') >= 0) {
          newClass = newClass.replace(' ' + cls + ' ', ' ');
        }
        elem.className = newClass.replace(/^\s+|\s+$/g, '');
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
            callback: util.closure(name)
          }
          this.routerMap.push(item)
        }

      }


      this.map()
      // 跳转
      window.linkTo = (path) => {
        console.log('linkTo: ', path)
        if (path.indexOf("?") !== -1) {
          window.location.hash = path + '&key=' + util.genKey()
        } else {
          window.location.hash = path + '?key=' + util.genKey()
        }
      }
      window.addEventListener('load', function (event) {
        // console.log('load')
        self.historyChange(event)
      }, false)

      // 路由跳转
      window.addEventListener('hashchange', (event) => {
        self.historyChange(event)
      }, false)

    },
    historyChange(event) {
      // 当前hash
      let currentHash = util.getParamsUrl()
      let nameStr = 'router-' + (this.routerViewId) + '-history'
      this.history = window.sessionStorage[nameStr] ? JSON.parse(window.sessionStorage[nameStr]) : []

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
        // console.log(item)
        // console.log(this.history)
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
      let currentHash = util.getParamsUrl()
      if (this.routes[currentHash.path]) {
        let self = this
        if (this.beforeFun) {

          this.beforeFun({
            to: {
              path: currentHash.path,
              query: currentHash.query
            },
            next() {
              self.changeView(currentHash)
            }
          })
        } else {
          this.changeView(currentHash)
        }
        
      } else {
        console.log(this.redirectRoute)
        location.hash = this.redirectRoute
      }
    },
    changeView(currentHash) {
      let pages = document.getElementsByClassName('page')
      let previousPage = document.getElementsByClassName('current')[0]
      let currentPage = null
      let currHash = null
      for (let i = 0; i < pages.length; i++) {
        let page = pages[i]
        let hash = page.getAttribute('data-hash')
        page.setAttribute('class', 'page')
        if (hash === currentHash.path) {
          currHash = hash
          currentPage = page
        }
      }
      let enterName = 'enter-' + this.animationName
      let leaveName = 'leave-' + this.animationName

      if (this.historyFlag === 'black') {
        util.addClass(currentPage, 'current')
        if (previousPage) {
          util.addClass(previousPage, leaveName)
        }
        setTimeout(() => {
          if (previousPage) {
            util.removeClass(previousPage, leaveName)
          }
        }, 250)
      } else if (this.historyFlag === 'forward' || this.historyFlag === 'refresh') {
        if (previousPage) {
          util.addClass(previousPage, 'current')
        }
        util.addClass(currentPage, enterName)

        setTimeout(() => {
          if (previousPage) {
            util.removeClass(previousPage, 'current')
          }
          util.removeClass(currentPage, enterName)
          util.addClass(currentPage, 'current')
        }, 350)
        currentPage.scrollTop = 1000
        this.routes[currHash].callback ? this.routes[currHash].callback(currentHash) : null

      }
      this.afterFun ? this.afterFun(currentHash) : null
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
      // console.log(this.routes)
    },
 //切换之前的钩子
    beforeEach: function (callback) {
      if (Object.prototype.toString.call(callback) === '[object Function]') {
        this.beforeFun = callback;
      } else {
        console.trace('路由切换前钩子函数不正确')
      }
    },
    afterEach (callback) {
      if (Object.prototype.toString.call(callback) === '[object Function]') {
        this.afterFun = callback;
      } else {
        console.trace('err')
      }
    }
  }


  window.Router = Router;
  window.router = new Router();
})()
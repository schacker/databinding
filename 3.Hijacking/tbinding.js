/**
 * 定义发布订阅对象
 * 发布者：我要干什么事情
 * 订阅者：我希望干什么事情
 */
var PubSub = {
    subscrib: function(ev, callback) {
        this._callbacks || (this._callbacks = {});
        (this._callbacks[ev] || (this._callbacks[ev] = [])).push(callback) //添加订阅事件的回调

        return this
    },
    publish: function() {
        var args = Array.prototype.slice.call(arguments)
        var ev = args.shift()
        var cb = this._callbacks
        if (!cb) {
            return this
        }
        if (!cb[ev]) {
            return this
        }
        var len = cb[ev].length
        for (var i = 0;i < len;i++) {
            cb[ev][i].apply(this, args)
        }
        return this
    }
}

/**
 * 绑定对象
 * 特定元素绑定，发布UI更新事件
 * 订阅数据更新时间
 */
var Bind = (function(){
    function eventHandler(e) {
        var target = e.target || e.srcElement
        var bindingName = target.getAttribute('lj-binding')
        if (bindingName) {
            PubSub.publish('ui-binding-event', bindingName, target.value) //发布UI
        }
    }
    var ael = document.addEventListener
    var ae = document.attachEvent
    if (ael) {
        ael('keyup', eventHandler, false)
        ael('change', eventHandler, false)
    } else if (ae) {
        ae('keyup', eventHandler)
        ae('change', eventHandler)
    }
    //订阅MODEL
    PubSub.subscrib('model-binding-event', function(eventName, value){
        var elements = document.querySelectorAll('[lj-binding="' +eventName+ '"]')
        var len = elements.length
        for (var i = 0;i < len;i++) {
            var item = elements[i]
            var elementType = item.tagName.toLowerCase()
            // 更新UI
            if (elementType === 'input' || elementType === 'textarea' || elementType === 'select') {
                item.value = value
            } else {
                item.innerHTML = value
            }
        }
    })
    return {
        modelName: '',
        initModel: function(modelName){
            this.modelName = modelName
            PubSub.subscrib('ui-binding-event', function(eventName, value){ //订阅UI
                var attrs = eventName.split('.')
                eval(attrs[0])[attrs[1]] = value //更新MODEL
            })
            return Object.create(this)
        },
        loadModelData: function(modelData) {
            for (prop in modelData) {
                this.defineObjProp(this, prop, modelData[prop])
            }
        },
        defineObjProp: function(obj, propName, propValue) {
            console.log(obj)
            var that = this
            var _value = propValue || ''
            try {
                Object.defineProperty(obj, propName, {
                    get: function() {
                        return _value
                    },
                    set: function(value) {
                        _value = value
                        PubSub.publish('model-binding-event', that.modelName+'.'+propName, value) //发布MODEL
                    },
                    enumerable: true,
                    configurable: true
                });
                obj[propName] = _value
            } catch(e){
                console.log(e, '浏览器必须IE8+')
            }
        }
    }
}());
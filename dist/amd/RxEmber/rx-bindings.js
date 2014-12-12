define("RxEmber/rx-bindings", ["exports"], function(__exports__) {
  "use strict";

  function __es6_export__(name, value) {
    __exports__[name] = value;
  }

  /*globals Rx, Ember*/

  function noop() {}

  __es6_export__("default", Ember.Mixin.create({
    /**
      The mappings for binding Rx.Observable properties on the class to output properties on the class.
      @property rxBindings
      @type Object
      @default null
    */
    rxBindings: null,

    /**
      An event hook that will be called just before the subscriptions to 
      the rxBinding observables are made.
      @property willSubscribe
      @type Function
      @default noop
    */
    willSubscribe: noop,

    /**
      An event hook that will be called just after the subscriptions to 
      the rxBinding observables are made.
      @property didSubscribe
      @type Function
      @default noop
    */
    didSubscribe: noop,
    
    /**
      An event hook that will be called just prior to disposing subscriptions
      @property willDispose
      @type Function
      @default noop
    */
    willDispose: noop,
    
    /**
      An event hook that will be called just after disposing subscriptions
      @property didSubscribe
      @type Function
      @default noop
    */
    didDispose: noop,
    
    /**
      An composite disposable that can dispose of all subscriptions made
      via `subscribeTo`
      @property instanceDisposable
      @type Rx.CompositeDisposable
      @default null
    */
    instanceDisposable: null,
    
    /**
      Subscribes to the observable passed and adds the subscription disposable to the composite
      diposable for the instance (`instanceDisposable`)
      @method subscribeTo
      @param observable {Rx.Observable} the observable to subscribe to
      @param next {Function} the required next function that will be called onNext for subscription
      @param err {Function} the function to be call onError for the observable
      @param completed {Function} the function to be called onCompleted for the observable.
      @return {Rx.Disposable} the disposable created by the subscription
    */
    subscribeTo: function(observable, next, err, completed) {
      this.instanceDisposable = this.instanceDisposable || new Rx.CompositeDisposable();
      var disposable = observable.subscribe(next.bind(this), err ? err.bind(this) : undefined, completed ? completed.bind(this) : undefined);
      this.instanceDisposable.add(disposable);
      return disposable;
    },

    /**
      Calls dispose on the instance disposable, ending all subscriptions, then resets the
      instance disposable back to null
      @method dispose
    */
    dispose: function(){
      this.willDispose.apply(this);
      if(this.instanceDisposable) {
        this.instanceDisposable.dispose();
      }
      this.instanceDisposable = null;
      this.didDispose.apply(this);
    },
    
    //TODO: better explanation of config object.
    /**
      Creates a subscription from the source (observable) property, to update the target property
      @method addRxBinding
      @param source {string} the name of the observable property to subscribe to
      @param target {string|Object} the name of the property to update, or a configuration object.
      @return {Rx.Disposable} the rx disposable to remove the binding (unsubscribe).
    */
    addRxBinding: function(source, target) {
      var sourceObs = this.get(source);
      if(!sourceObs) {
        return;
      }
      var key, nextFn;

      if(typeof target === 'string') {
        key = target;
        nextFn = function(d) { 
          this.set(key, d); 
        };
      }

      if(typeof target === 'object') {
        key = target.key;
        nextFn = target.next;
      }

      return this.subscribeTo(sourceObs, nextFn, function(err) {
        console.error('RxBinding error %s: %O', key, err);
      });
    },

    /**
      Creates subscriptions from all items in `rxBindings` using `addRxBinding`.
      @method subscribe
    */
    subscribe: function(){
      this.willSubscribe.apply(this);
      var rxBindings = this.get('rxBindings');
      if(rxBindings) {
        Ember.keys(rxBindings).forEach(function(source) {
          var target = rxBindings[source];
          this.addRxBinding.call(this, source, target);
        }, this);
      }
      this.didSubscribe.apply(this);
    },
  }));
});

//# sourceMappingURL=rx-bindings.js.map
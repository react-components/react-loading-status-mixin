/**
 * Module dependencies
 */

var React = require('react');
var raf = require('raf');

var ReactObject = React.PropTypes.object;

module.exports = {
  componentWillMount: function() {
    // parent
    this._scheduleStatusUpdate = createScheduleStatusUpdate();

    // child
    var parent = this._getParentComponent();
    if (parent) parent._registerChild(this._rootNodeID);
  },
  componentWillUnmount: function() {
    // child
    var parent = this._getParentComponent();
    if (parent) parent._unregisterChild(this._rootNodeID);
  },

  // parent

  /**
   * Get the loaded status for the component
   *
   * @return {Boolean}
   * @api public
   */

  isLoaded: function() {
    var state = this.state;
    return !(state.loadingStatus || (this._childrenCount ? state.childrenLoadingStatus : false));
  },

  /**
   * Pass the parent down to the children through the context
   *
   * @api private
   */

  childContextTypes: {
    parentComponent: ReactObject
  },
  getChildContext: function() {
    return {
      parentComponent: this
    };
  },

  /**
   * Setup the initial loading state
   */

  getInitialState: function() {
    return {
      loadingStatus: true,
      childrenLoadingStatus: true
    };
  },

  /**
   * Setup child registration/deregistration
   */

  _children: {},
  _childrenCount: 0,
  _registerChild: function(key) {
    var self = this;
    var children = self._children;
    if (typeof children[key] !== 'undefined') return;

    children[key] = true;
    self._childrenCount++;
    self._scheduleStatusUpdate();
  },
  _unregisterChild: function(key) {
    var self = this;
    var children = self._children;
    if (typeof children[key] === 'undefined') return;

    delete children[key];
    self._childrenCount--;
    self._scheduleStatusUpdate();
  },

  /**
   * Helper methods for updaing the child status
   *
   * @api private
   */

  _updateChildrenLoadingStatus: function() {
    var self = this;
    var children = self._children;
    var isLoading = false;
    for (var k in children) {
      if (children[k]) {
        isLoading = true;
        break;
      }
    }
    self.setState({childrenLoadingStatus: isLoading});
  },
  _setChildLoadingStatus: function(key, status) {
    var children = this._children;
    var prev = children[key];
    if (prev !== status) this._scheduleStatusUpdate();
    children[key] = status;
  },

  // child

  /**
   * Set the loaded status for the component
   *
   * @param {Boolean} isLoaded
   * @api public
   */

  setIsLoaded: function(isLoaded) {
    var self = this;
    var parent = self._getParentComponent();
    var isLoading = !isLoaded;

    isLoading = isLoading || false;
    self.state.loadingStatus = isLoading;

    if (parent) parent._setChildLoadingStatus(self._rootNodeID, isLoading);
    else self._scheduleStatusUpdate(self.forceUpdate);
  },

  /**
   * Recieve the parent component
   */

  contextTypes: {
    parentComponent: ReactObject
  },
  _getParentComponent: function() {
    var context = this.context;
    return context && context.parentComponet;
  }
};

/**
 * Create a schedule status update function that is debounced
 */

function createScheduleStatusUpdate() {
  var isChanging = false;
  var shouldUpdate = false;

  function update(self, fn) {
    raf(function() {
      if (self.isMounted()) {
        try {
          fn();
        } catch(e) {}
      }
      isChanging = false;
      if (shouldUpdate) update(self);
      shouldUpdate = false;
    });
  }

  return function _scheduleStatusUpdate(fn) {
    if (isChanging) return shouldUpdate = true;
    var self = this;
    isChanging = true;
    update(self, fn || self._updateChildrenLoadingStatus);
  };
}

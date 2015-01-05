react-loading-status-mixin
==========================

get the loading status of the component tree

Usage
-----

```js
var LoadingStatusMixin = require('react-loading-status-mixin');

React.createClass({
  mixins: [LoadingStatusMixin],
  componentWillMount: function() {
    var self = this;
    request.get('/api', function(res) {
      self.setState({data: res});

      // tell the mixin the component has loaded its data
      self.setIsLoaded(true);
    });
  },
  render: function() {
    // compute the className based on the loaded status
    var className = this.isLoaded() ? 'loaded' : 'loading';

    return (
      React.DOM.div({className: className})
    );
  }
});
```

API
---

### setIsLoaded(isLoaded)

Set the loaded status for the component

### isLoaded()

Get the loaded status for the component, including all of the children

import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

import { ConnectedRouter } from 'connected-react-router';

import { DevTools } from 'containers/DevTools';
import { router } from 'router';
import { isProduction } from 'utils';

import 'image/favicon.ico';
import 'material-design-icons/iconfont/material-icons.css';
import 'materialize-css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'sass/index.scss';

// Set the store, history and routers
export default class App extends React.Component {
  render() {
    return (
      <Provider store={this.props.store}>
        <ConnectedRouter history={this.props.history}>
          <div>
            {router}
            {!isProduction && <DevTools />}
          </div>
        </ConnectedRouter>
      </Provider>
    );
  }
}

App.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

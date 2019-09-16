import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import thunk from 'redux-thunk';

import core from 'core';
import actions from 'actions';
import App from 'components/App';
import { workerTypes } from 'constants/types';
import defaultTool from 'constants/defaultTool';
import getBackendPromise from 'helpers/getBackendPromise';
import loadCustomCSS from 'helpers/loadCustomCSS';
import loadScript, { loadConfig } from 'helpers/loadScript';
import setupLoadAnnotationsFromServer from 'helpers/setupLoadAnnotationsFromServer';
import setupMIMETypeTest from 'helpers/setupMIMETypeTest';
import eventHandler from 'helpers/eventHandler';
import setupPDFTron from 'helpers/setupPDFTron';
import setupI18n from 'helpers/setupI18n';
import setAutoSwitch from 'helpers/setAutoSwitch';
import setDefaultDisabledElements from 'helpers/setDefaultDisabledElements';
import setupDocViewer from 'helpers/setupDocViewer';
import setDefaultToolStyles from 'helpers/setDefaultToolStyles';
import setUserPermission from 'helpers/setUserPermission';
import logDebugInfo from 'helpers/logDebugInfo';
import rootReducer from 'reducers/rootReducer';

const middleware = [thunk];

if (process.env.NODE_ENV === 'development') {
  const { createLogger } = require('redux-logger');
  middleware.push(createLogger({ collapsed: true }));
}

const store = createStore(rootReducer, applyMiddleware(...middleware));


if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('reducers/rootReducer', () => {
    const updatedReducer = require('reducers/rootReducer').default;
    store.replaceReducer(updatedReducer);
  });

  module.hot.accept();
}

if (window.CanvasRenderingContext2D) {
  let fullAPIReady = Promise.resolve();
  const state = store.getState();

  if (state.advanced.fullAPI) {
    window.CoreControls.enableFullPDF(true);
    if (process.env.NODE_ENV === 'production') {
      fullAPIReady = loadScript('../core/pdf/PDFNet.js');
    } else {
      fullAPIReady = loadScript('../core/pdf/PDFNet.js');
    }
  }

  window.CoreControls.enableSubzero(state.advanced.subzero);
  if (process.env.NODE_ENV === 'production') {
    window.CoreControls.setWorkerPath('../core');
    window.CoreControls.setResourcesPath('../core/assets');
  }

  try {
    if (state.advanced.useSharedWorker && window.parent.WebViewer) {
      var workerTransportPromise = window.parent.WebViewer.workerTransportPromise(window.frameElement);
      // originally the option was just for the pdf worker transport promise, now it can be an object
      // containing both the pdf and office promises
      if (workerTransportPromise.pdf || workerTransportPromise.office) {
        window.CoreControls.setWorkerTransportPromise(workerTransportPromise);
      } else {
        window.CoreControls.setWorkerTransportPromise({ 'pdf': workerTransportPromise });
      }
    }
  } catch (e) {
    console.warn(e);
    if (e.name === 'SecurityError') {
      console.warn('workerTransportPromise option cannot be used with CORS');
    }
  }

  const { preloadWorker } = state.advanced;
  const { PDF, OFFICE, ALL } = workerTypes;

  if (preloadWorker) {
    if (preloadWorker === PDF || preloadWorker === ALL) {
      getBackendPromise(state.document.pdfType).then(pdfType => {
        window.CoreControls.initPDFWorkerTransports(pdfType, {
          workerLoadingProgress: percent => {
            store.dispatch(actions.setWorkerLoadingProgress(percent));
          },
        }, window.sampleL);
      });
    }

    if (preloadWorker === OFFICE || preloadWorker === ALL) {
      getBackendPromise(state.document.officeType).then(officeType => {
        window.CoreControls.initOfficeWorkerTransports(officeType, {
          workerLoadingProgress: percent => {
            store.dispatch(actions.setWorkerLoadingProgress(percent));
          },
        }, window.sampleL);
      });
    }
  }

  loadCustomCSS(state.advanced.customCSS);

  logDebugInfo(state.advanced);

  fullAPIReady.then(() => loadConfig()).then(() => {
    const { addEventHandlers, removeEventHandlers } = eventHandler(store);
    const docViewer = new window.CoreControls.DocumentViewer();
    window.docViewer = docViewer;
    setupPDFTron();
    setupDocViewer();
    setupI18n(state);
    setupMIMETypeTest(store);
    setUserPermission(state);
    setAutoSwitch();
    addEventHandlers();
    setDefaultDisabledElements(store);
    setupLoadAnnotationsFromServer(store);
    setDefaultToolStyles();
    core.setToolMode(defaultTool);

    document.getElementById('app').addEventListener('touchstart', (e) => {
      // e.target.dispatchEvent(event);
      // e.preventDefault();
      // if (e.touches && e.touches.length === 1) {
      //   const touch = e.touches[0];

      //   const simulatedEvent = document.createEvent('MouseEvent');
      //   simulatedEvent.initMouseEvent({
      //     touchstart: 'mousedown',
      //     touchmove: 'mousemove',
      //     touchend: 'mouseup',
      //     tap: 'click'
      //   }[event.type], true, true, window, 1,
      //   touch.screenX, touch.screenY,
      //   touch.clientX, touch.clientY, false,
      //   false, false, false, 0, null);
      //   console.log('ui','touchstart',simulatedEvent.type);
      //   touch.target.dispatchEvent(simulatedEvent);
      // }

      // e.preventDefault();
      // e.stopPropagation();
    });
    document.getElementById('app').addEventListener('touchend', (e) => {
      // e.target.dispatchEvent(event);
      // e.preventDefault();
      // if (e.touches && e.touches.length === 1) {
      //   const touch = e.touches[0];

      //   const simulatedEvent = document.createEvent('MouseEvent');
      //   simulatedEvent.initMouseEvent({
      //     touchstart: 'mouseup',
      //     touchmove: 'mousemove',
      //     touchend: 'mouseup',
      //     tap: 'click'
      //   }[event.type], true, true, window, 1,
      //   touch.screenX, touch.screenY,
      //   touch.clientX, touch.clientY, false,
      //   false, false, false, 0, null);
      //   console.log('ui','touchend',simulatedEvent.type);
      //   touch.target.dispatchEvent(simulatedEvent);
      // }

      // e.preventDefault();
      // e.stopPropagation();
    });

    document.getElementById('app').addEventListener('tap', (e) => {
      // e.target.dispatchEvent(event);
      // e.preventDefault();
      // if (e.touches && e.touches.length === 1) {
      //   const touch = e.touches[0];

      //   const simulatedEvent = document.createEvent('MouseEvent');
      //   simulatedEvent.initMouseEvent({
      //     touchstart: 'mouseup',
      //     touchmove: 'mousemove',
      //     touchend: 'mouseup',
      //     tap: 'mousedown'
      //   }[event.type], true, true, window, 1,
      //   touch.screenX, touch.screenY,
      //   touch.clientX, touch.clientY, false,
      //   false, false, false, 0, null);
      //   console.log('ui','tap',simulatedEvent.type);
      //   touch.target.dispatchEvent(simulatedEvent);

      //   simulatedEvent.initMouseEvent({
      //     touchstart: 'mouseup',
      //     touchmove: 'mousemove',
      //     touchend: 'mouseup',
      //     tap: 'mouseup'
      //   }[event.type], true, true, window, 1,
      //   touch.screenX, touch.screenY,
      //   touch.clientX, touch.clientY, false,
      //   false, false, false, 0, null);
      //   console.log('ui','tap',simulatedEvent.type);
      //   touch.target.dispatchEvent(simulatedEvent);

      //   simulatedEvent.initMouseEvent({
      //     touchstart: 'mouseup',
      //     touchmove: 'mousemove',
      //     touchend: 'mouseup',
      //     tap: 'click'
      //   }[event.type], true, true, window, 1,
      //   touch.screenX, touch.screenY,
      //   touch.clientX, touch.clientY, false,
      //   false, false, false, 0, null);
      //   console.log('ui','tap',simulatedEvent.type);
      //   touch.target.dispatchEvent(simulatedEvent);
      // }

      // e.preventDefault();
      // e.stopPropagation();
    });

    ReactDOM.render(
      <Provider store={store}>
        <I18nextProvider i18n={i18next}>
          <App removeEventHandlers={removeEventHandlers} />
        </I18nextProvider>
      </Provider>,
      document.getElementById('app'),
    );
  });
}

window.addEventListener('hashchange', () => {
  window.location.reload();
});
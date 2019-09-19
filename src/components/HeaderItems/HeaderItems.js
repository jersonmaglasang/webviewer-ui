import React from 'react';
import PropTypes from 'prop-types';

import ToolButton from 'components/ToolButton';
import ToolGroupButton from 'components/ToolGroupButton';
import ToggleElementButton from 'components/ToggleElementButton';
import ActionButton from 'components/ActionButton';
import StatefulButton from 'components/StatefulButton';
import CustomElement from 'components/CustomElement';

import core from 'core';

import './HeaderItems.scss';

import selectors from 'selectors';
import { connect } from 'react-redux';

class HeaderItems extends React.PureComponent {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,

    currentPage: PropTypes.number,
  }

  rotateRight = () => {
    console.log(this.props.currentPage);
  }

  render() {
    const { items } = this.props;
    return (
      <div className="HeaderItems">
        {/* TODO remove this */}
        <button>Up</button>
        <button>Down</button>
        <button>Left</button>
        <button>Right</button>
        <button>Rotate Left</button>
        <button onClick={this.rotateRight}>Rotate Right</button>
        {items.map((item, i) => {
          const { type, dataElement, hidden } = item;
          const mediaQueryClassName = hidden ? hidden.map(screen => `hide-in-${screen}`).join(' ') : `${item.className || ''}`;
          const key = `${type}-${dataElement || i}`;
          switch (type) {
            case 'toolButton':
              return <ToolButton key={key} mediaQueryClassName={mediaQueryClassName} {...item} />;
            case 'toolGroupButton':
              return <ToolGroupButton key={key} mediaQueryClassName={mediaQueryClassName} {...item} />;
            case 'toggleElementButton':
              return <ToggleElementButton key={key} mediaQueryClassName={mediaQueryClassName} {...item} />;
            case 'actionButton':
              return <ActionButton key={key} mediaQueryClassName={mediaQueryClassName} {...item} />;
            case 'statefulButton':
              return <StatefulButton key={key} mediaQueryClassName={mediaQueryClassName} {...item} />;
            case 'customElement':
              return <CustomElement key={key} mediaQueryClassName={mediaQueryClassName} {...item} />;
            case 'spacer':
            case 'divider':
              return <div key={key} className={`${type} ${mediaQueryClassName}`}></div>;
            default:
              console.warn(`${type} is not a valid header item type.`);
          }
        })}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  currentPage: selectors.getCurrentPage(state),
});

// export default HeaderItems;
// TODO remove this
export default connect(
  mapStateToProps,
)((HeaderItems));
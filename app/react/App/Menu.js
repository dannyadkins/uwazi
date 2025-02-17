import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { wrapDispatch } from 'app/Multireducer';
import { NeedAuthorization } from 'app/Auth';
import { I18NLink, I18NMenu, t } from 'app/I18N';
import { processFilters, encodeSearch } from 'app/Library/actions/libraryActions';
import { showSemanticSearch } from 'app/SemanticSearch/actions/actions';
import { Icon } from 'UI';

export class Menu extends Component {
  libraryUrl() {
    const { searchTerm } = this.props.location.query;
    const params = processFilters(this.props.librarySearch, this.props.libraryFilters.toJS());
    params.searchTerm = searchTerm;
    return `/library/${encodeSearch(params)}`;
  }

  uploadsUrl() {
    const params = processFilters(this.props.uploadsSearch, this.props.uploadsFilters.toJS());
    return `/uploads/${encodeSearch(params)}`;
  }

  renderSemanticSearchButton() {
    if (!this.props.semanticSearch) {
      return false;
    }
    return (
      <NeedAuthorization roles={['admin']}>
        <li className="menuNav-item semantic-search">
          <button type="button" onClick={this.props.showSemanticSearch} className="menuNav-btn btn btn-default">
            <Icon icon="flask" />
            <span className="tab-link-tooltip">{t('System', 'Semantic search')}</span>
          </button>
        </li>
      </NeedAuthorization>
    );
  }

  render() {
    const { links } = this.props;
    const user = this.props.user.toJS();

    const navLinks = links.map((link) => {
      const url = link.get('url') || '/';

      if (url.startsWith('http')) {
        return (
          <li key={link.get('_id')} className="menuNav-item">
            <a href={url} className="btn menuNav-btn" target="_blank">{t('Menu', link.get('title'))}</a>
          </li>
        );
      }
      return (
        <li key={link.get('_id')} className="menuNav-item">
          <I18NLink to={url} className="btn menuNav-btn">{t('Menu', link.get('title'))}</I18NLink>
        </li>
      );
    });

    return (
      <ul onClick={this.props.onClick} className={this.props.className}>
        <li className="menuItems">
          <ul className="menuNav-list">{navLinks}</ul>
        </li>
        <li className="menuActions">
          <ul className="menuNav-list">
            {this.renderSemanticSearchButton()}
            <li className="menuNav-item">
              <I18NLink to={this.libraryUrl()} className="menuNav-btn btn btn-default">
                <Icon icon="th" />
                <span className="tab-link-tooltip">{t('System', 'Public documents')}</span>
              </I18NLink>
            </li>
            <NeedAuthorization roles={['admin', 'editor']}>
              <li className="menuNav-item">
                <I18NLink to={this.uploadsUrl()} className="menuNav-btn btn btn-default">
                  <span>
                    <Icon icon="cloud-upload-alt" />
                  </span>
                  <span className="tab-link-tooltip">{t('System', 'Private documents')}</span>
                </I18NLink>
              </li>
            </NeedAuthorization>
            <NeedAuthorization roles={['admin', 'editor']}>
              <li className="menuNav-item">
                <I18NLink to="/settings/account" className="menuNav-btn btn btn-default">
                  <Icon icon="cog" />
                  <span className="tab-link-tooltip">{t('System', 'Account settings')}</span>
                </I18NLink>
              </li>
            </NeedAuthorization>
            {(() => {
              if (!user._id) {
                return (
                  <li className="menuNav-item">
                    <I18NLink to="/login" className="menuNav-btn btn btn-default">
                      <Icon icon="power-off" />
                      <span className="tab-link-tooltip">{t('System', 'Sign in')}</span>
                    </I18NLink>
                  </li>
                );
              }

              return null;
            })()}
          </ul>
          <I18NMenu />
        </li>
      </ul>
    );
  }
}

Menu.defaultProps = {
  semanticSearch: false,
  showSemanticSearch: () => {}
};

Menu.propTypes = {
  user: PropTypes.object,
  location: PropTypes.object,
  librarySearch: PropTypes.object,
  libraryFilters: PropTypes.object,
  uploadsSearch: PropTypes.object,
  uploadsFilters: PropTypes.object,
  className: PropTypes.string,
  onClick: PropTypes.func,
  showSemanticSearch: PropTypes.func,
  semanticSearch: PropTypes.bool,
  links: PropTypes.object
};

export function mapStateToProps({ user, settings, library, uploads }) {
  const features = settings.collection.toJS().features || {};
  return {
    user,
    librarySearch: library.search,
    libraryFilters: library.filters,
    uploadsSearch: uploads.search,
    uploadsFilters: uploads.filters,
    uploadsSelectedSorting: uploads.selectedSorting,
    links: settings.collection.get('links'),
    semanticSearch: features.semanticSearch
  };
}

export function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    showSemanticSearch
  }, wrapDispatch(dispatch, 'library'));
}


export default connect(mapStateToProps, mapDispatchToProps)(Menu);

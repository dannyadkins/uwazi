/** @format */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { actions } from 'app/BasicReducer';
import UsersAPI from 'app/Users/UsersAPI';
import { notify as notifyAction } from 'app/Notifications/actions/notificationsActions';
import { RequestParams } from 'app/utils/RequestParams';
import { t, I18NLink } from 'app/I18N';
import { Icon } from 'UI';
import Auth2faAPI from 'app/Auth2fa/Auth2faAPI';

export class AccountSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      email: props.user.email || '',
      password: '',
      repeatPassword: '',
      using2fa: props.user.using2fa,
      otpauth: '',
    };

    this.getSecret = this.getSecret.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({ email: props.user.email || '' });
  }

  async getSecret() {
    const { otpauth } = await Auth2faAPI.getSecret();
    this.setState({ otpauth });
  }

  passwordChange(e) {
    this.setState({ password: e.target.value });
    this.setState({ passwordError: false });
  }

  repeatPasswordChange(e) {
    this.setState({ repeatPassword: e.target.value });
    this.setState({ passwordError: false });
  }

  updateEmail(e) {
    const { email } = this.state;
    const { user, notify, setUser } = this.props;

    e.preventDefault();
    const userData = Object.assign({}, user, { email });
    UsersAPI.save(new RequestParams(userData)).then(result => {
      notify(t('System', 'Email updated', null, false), 'success');
      setUser(Object.assign(userData, { _rev: result.rev }));
    });
  }

  updatePassword(e) {
    e.preventDefault();

    const { password, repeatPassword } = this.state;
    const { user, notify, setUser } = this.props;

    const passwordsDontMatch = password !== repeatPassword;
    const emptyPassword = password.trim() === '';
    if (emptyPassword || passwordsDontMatch) {
      this.setState({ passwordError: true });
      return;
    }

    UsersAPI.save(new RequestParams(Object.assign({}, user, { password }))).then(result => {
      notify(t('System', 'Password updated', null, false), 'success');
      setUser(Object.assign(user, { _rev: result.rev }));
    });
    this.setState({ password: '', repeatPassword: '' });
  }

  emailChange(e) {
    this.setState({ email: e.target.value });
  }

  render() {
    const { email, password, repeatPassword, passwordError, otpauth, using2fa } = this.state;

    return (
      <div className="account-settings">
        <div className="panel panel-default">
          <div className="panel-heading">{t('System', 'Account')}</div>
          <div className="panel-body">
            <h5>{t('System', 'Email address')}</h5>
            <form onSubmit={this.updateEmail.bind(this)}>
              <div className="form-group">
                <label className="form-group-label" htmlFor="collection_name">
                  {t('System', 'Email')}
                </label>
                <input
                  type="email"
                  onChange={this.emailChange.bind(this)}
                  value={email}
                  className="form-control"
                />
              </div>
              <button type="submit" className="btn btn-success">
                {t('System', 'Update')}
              </button>
            </form>
            <hr />
            <h5>{t('System', 'Change password')}</h5>
            <form onSubmit={this.updatePassword.bind(this)}>
              <div className={`form-group${passwordError ? ' has-error' : ''}`}>
                <label className="form-group-label" htmlFor="password">
                  {t('System', 'New password')}
                </label>
                <input
                  type="password"
                  onChange={this.passwordChange.bind(this)}
                  value={password}
                  id="password"
                  className="form-control"
                />
              </div>
              <div className={`form-group${passwordError ? ' has-error' : ''}`}>
                <label className="form-group-label" htmlFor="repeatPassword">
                  {t('System', 'Confirm new password')}
                </label>
                <input
                  type="password"
                  onChange={this.repeatPasswordChange.bind(this)}
                  value={repeatPassword}
                  id="repeatPassword"
                  className="form-control"
                />
              </div>
              {passwordError && (
                <div className="validation-error validation-error-centered">
                  <Icon icon="exclamation-triangle" />
                  &nbsp;
                  {t('System', 'Password Error')}
                </div>
              )}
              <button type="submit" className="btn btn-success">
                {t('System', 'Update')}
              </button>
            </form>
            <hr />
            <h5>{t('System', 'Two-step verification')}</h5>
            {using2fa && (
              <div className="alert alert-info">
                <Icon icon="check" size="2x" />
                <div className="force-ltr">Your account is protected by 2fa.</div>
              </div>
            )}
            {!using2fa && (
              <div>
                <div className="alert alert-warning">
                  <Icon icon="exclamation-triangle" size="2x" />
                  <div className="force-ltr">
                    You should activate this feature for enhanced account security
                  </div>
                </div>
                <div>
                  <I18NLink to="/settings/2fa" className="btn btn-success">
                    {t('System', 'Protect your account')}
                  </I18NLink>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="settings-footer">
          <a href="/logout" className="btn btn-danger">
            <Icon icon="power-off" />
            <span className="btn-label">{t('System', 'Logout')}</span>
          </a>
        </div>
      </div>
    );
  }
}

AccountSettings.defaultProps = {
  user: {},
};

AccountSettings.propTypes = {
  user: PropTypes.instanceOf(Object),
  notify: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired,
};

export function mapStateToProps(state) {
  return { user: state.user.toJS() };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { setUser: actions.set.bind(null, 'auth/user'), notify: notifyAction },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountSettings);

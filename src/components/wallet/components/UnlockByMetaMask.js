import React from 'react';
import { Link } from 'dva/router';
import { Modal, Button,Icon,Alert } from 'antd';
import MetaMaskUnlockAccount from '../../../modules/account/MetaMaskUnlockAccount'
import intl from 'react-intl-universal';
import {unlockRedirection} from '../../../common/utils/redirection'
import Notification from 'Loopr/Notification'

const walletType = "MetaMask"

class UnlockByMetaMask extends React.Component {
  state = {
    loading: false,
    browserType: '',
    browserSupported: false,
    disableContent:''
  };

  componentDidMount() {
    var u = navigator.userAgent, app = navigator.appVersion;
    if(u.indexOf('OPR') > -1) {
      this.setState({browserType:'Opera', browserSupported: true})
    } else if (u.indexOf('Chrome') > -1) {
      this.setState({browserType:'Chrome', browserSupported: true})
    } else if(u.indexOf('Firefox') > -1) {
      this.setState({browserType:'Firefox', browserSupported: true})
    } else {
      this.setState({browserType:'Others'})
    }
    let disableContent = ''
    if(window.web3){
      if(!window.web3.eth.accounts[0]) { // locked
        disableContent = intl.get('wallet.content_metamask_locked_title')
      }
    } else { // to install
      disableContent = intl.get('wallet.content_metamask_install_title')
    }
    this.setState({disableContent: disableContent})
  }

  connectToMetamask = () => {
    const {modal, account, pageFrom} = this.props
    this.setState({loading:true})
    if (window.web3 && window.web3.eth.accounts[0]) {
      window.web3.version.getNetwork((err, netId) => {
        if (netId !== '1') {
          Notification.open({
            message:intl.get('wallet.failed_connect_metamask_title'),
            description:intl.get('wallet.content_metamask_mainnet'),
            type:'error'
          })
          this.setState({loading:false})
          return
        }
        let selectedAccount = window.web3.eth.accounts[0]
        window.WALLET = new MetaMaskUnlockAccount({web3: window.web3, address: selectedAccount})
        window.WALLET_UNLOCK_TYPE = walletType
        account.setWallet({address:selectedAccount, walletType:walletType})
        this.setState({loading:false})
        modal.hideModal({id: 'wallet/unlock'});
        Notification.open({
          message:intl.get('wallet.unlocked_notification_title'),
          description:intl.get('wallet.unlocked_notification_content'),
          type:'success'
        })
        unlockRedirection(pageFrom)
        let alert = false
        var accountInterval = setInterval(function() {
          if ((!window.web3 || !window.web3.eth.accounts[0]) && !alert) {
            alert = true
            console.log("MetaMask account locked:", selectedAccount)
            clearInterval(accountInterval)
            account.deleteAccount({})
            Notification.open({
              message:intl.get('wallet.title_metamask_logout'),
              description:intl.get('wallet.content_metamask_logout'),
              type:'warning'
            })
            return
          }
          // page will be reload automatically
          window.web3.version.getNetwork((err, netId) => {
            if (netId !== '1' && !alert) {
              alert = true
              clearInterval(accountInterval)
              account.deleteAccount({})
              Notification.open({
                message:intl.get('wallet.failed_connect_metamask_title'),
                description:intl.get('wallet.content_metamask_unlock_again'),
                type:'error'
              })
              return
            }
          })
          if (window.web3.eth.accounts[0] !== selectedAccount) {
            selectedAccount = window.web3.eth.accounts[0];
            Notification.open({
              message:intl.get('wallet.title_metamask_account_change'),
              description:intl.get('wallet.content_metamask_account_change'),
              type:'info'
            })
            if(selectedAccount) {
              console.log("MetaMask account changed to:", selectedAccount)
              account.setWallet({address: selectedAccount})
            }
          }
        }, 100);
      })
    } else {
      let content = intl.get('wallet.content_metamask_install')
      if(window.web3 && !window.web3.eth.accounts[0]) { // locked
        content = intl.get('wallet.content_metamask_locked')
      }
      Notification.open({
        message:intl.get('wallet.failed_connect_metamask_title'),
        description:content,
        type:'error'
      })
      this.setState({loading:false})
    }
  }

  render() {
    const {loading} = this.state;
    return (
      <div className="text-left">
        <Alert
          message={<div className="color-green-600 fs18"><Icon type="like"/> {intl.get('wallet.recommended')}</div>}
          description={
            <div className="color-green-600 fs14">
              {intl.getHTML('wallet.instruction_metamask')}
            </div>
          }
          type="success"
          showIcon={false}
        />
        {this.state.browserSupported && this.state.browserType === "Chrome" &&
          <div>
            <div className="color-grey-500 fs14 mb10 mt15">
              <Icon type="export" className="mr5 fs14" /><a href="https://chrome.google.com/webstore/detail/nkbihfbeogaeaoehlefnkodbefgpgknn" target="_blank">{intl.get('wallet.get_metamask', {browser: 'Chrome'})}</a>
            </div>
            <div className="color-grey-500 fs14 mb10">
              <Icon type="export" className="mr5 fs14" /><a href="https://metamask.io/" target="_blank">{intl.get('wallet.get_metamask_visit')}</a>
          </div>
          </div>
        }
        {this.state.browserSupported && this.state.browserType === "Firefox" &&
        <div>
          <div className="color-grey-500 fs14 mb10 mt15">
            <Icon type="export" className="mr5 fs14" /><a href="https://addons.mozilla.org/firefox/addon/ether-metamask/" target="_blank">{intl.get('wallet.get_metamask', {browser: 'Firefox'})}</a>
          </div>
          <div className="color-grey-500 fs14 mb10">
            <Icon type="export" className="mr5 fs14" /><a href="https://metamask.io/" target="_blank">{intl.get('wallet.get_metamask_visit')}</a>
          </div>
        </div>
        }
        {this.state.browserSupported && this.state.browserType === "Opera" &&
        <div>
          <div className="color-grey-500 fs14 mb10 mt15">
            <Icon type="export" className="mr5 fs14" /><a href="https://addons.opera.com/extensions/details/metamask/" target="_blank">{intl.get('wallet.get_metamask', {browser: 'Opera'})}</a>
          </div>
          <div className="color-grey-500 fs14 mb10">
            <Icon type="export" className="mr5 fs14" /><a href="https://metamask.io/" target="_blank">{intl.get('wallet.get_metamask_visit')}</a>
          </div>
        </div>
        }
        {!this.state.browserSupported &&
          <div className="color-grey-500 fs14 mb10 mt15">
            <Icon type="export" className="mr5 fs14" /><a href="https://www.google.com/chrome/" target="_blank">{intl.get('wallet.download_chrome')}</a>
          </div>
        }
        {this.state.browserSupported && this.state.disableContent &&
          <Button type="primary" className="d-block w-100" size="large" disabled>{this.state.disableContent}</Button>
        }
        {this.state.browserSupported && !this.state.disableContent &&
        <Button type="primary" className="d-block w-100" size="large" onClick={this.connectToMetamask} loading={loading}>{intl.get('wallet.connect_to_metamask')}</Button>
        }
        {!this.state.browserSupported &&
          <Button type="primary" className="d-block w-100" size="large" disabled>{intl.get('wallet.connect_to_metamask_not_supported_browser')}</Button>
        }
      </div>
    )
  }
}

export default UnlockByMetaMask;
